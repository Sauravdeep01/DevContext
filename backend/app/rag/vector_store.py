import numpy as np
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.rag.chunker import CodeChunk
from app.rag.sanitizer import sanitizer

class VectorStore:
    """
    In-memory Hybrid Vector Database powered by TF-IDF n-gram embeddings
    and structural symbol indexing for high-precision code & doc retrieval.
    """
    def __init__(self):
        self.chunks: List[CodeChunk] = []
        self.vectorizer: TfidfVectorizer = None
        self.embeddings = None
        self.indexed_files: List[str] = []

    def clear(self):
        self.chunks = []
        self.vectorizer = None
        self.embeddings = None
        self.indexed_files = []

    def add_chunks(self, chunks: List[CodeChunk]):
        if not chunks:
            return

        self.chunks.extend(chunks)
        for c in chunks:
            if c.file_path not in self.indexed_files:
                self.indexed_files.append(c.file_path)

        # Build corpus using filename + chunk name + chunk type + sanitized content
        corpus = []
        for c in self.chunks:
            text = f"File: {c.file_path}\nType: {c.chunk_type}\nName: {c.name}\nContent:\n{c.content}"
            corpus.append(text)

        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            token_pattern=r'(?u)\b\w+\b|[^\w\s]'
        )
        self.embeddings = self.vectorizer.fit_transform(corpus)

    def search(self, query: str, top_k: int = 5, file_filter: str = None) -> List[Dict[str, Any]]:
        if not self.chunks or self.embeddings is None:
            return []

        sanitized_query, _ = sanitizer.sanitize(query)
        query_vec = self.vectorizer.transform([sanitized_query])
        sims = cosine_similarity(query_vec, self.embeddings).flatten()

        results = []
        for idx in range(len(sims)):
            score = float(sims[idx])
            chunk = self.chunks[idx]

            if file_filter and file_filter.lower() not in chunk.file_path.lower():
                continue

            # Boost score for exact symbol or filename matches
            boost = 0.0
            query_lower = query.lower()
            if chunk.name.lower() in query_lower:
                boost += 0.25
            if chunk.file_path.rsplit('/', 1)[-1].lower() in query_lower:
                boost += 0.2
            
            final_score = min(1.0, score + boost)

            results.append({
                "chunk": chunk.to_dict(),
                "score": round(final_score, 4),
                "raw_sim": round(score, 4)
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

vector_store = VectorStore()
