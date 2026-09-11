import os
from pathlib import Path
from typing import List, Dict, Any
from app.rag.chunker import chunker
from app.rag.vector_store import vector_store
from app.rag.sanitizer import sanitizer

SUPPORTED_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".py", ".json", ".yaml", ".yml", ".md", ".sql"}

class RAGIngestionService:
    def index_directory(self, repo_path: str) -> Dict[str, Any]:
        """
        Indexes a directory by sanitizing secrets, running code-aware chunking,
        and building the vector store.
        """
        p = Path(repo_path)
        if not p.exists():
            raise FileNotFoundError(f"Path not found: {repo_path}")

        vector_store.clear()
        total_files = 0
        total_chunks = 0
        total_secrets_redacted = 0

        for root, dirs, files in os.walk(p):
            # Skip hidden and node_modules / venv directories
            dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ["node_modules", "venv", "__pycache__", "dist", "build"]]
            
            for file in files:
                ext = Path(file).suffix.lower()
                if ext in SUPPORTED_EXTENSIONS:
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, p).replace("\\", "/")
                    
                    try:
                        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                            raw_content = f.read()

                        # Secret Redaction
                        clean_content, secrets_count = sanitizer.sanitize(raw_content)
                        total_secrets_redacted += secrets_count

                        # Chunking
                        chunks = chunker.chunk_file(rel_path, clean_content)
                        if chunks:
                            vector_store.add_chunks(chunks)
                            total_files += 1
                            total_chunks += len(chunks)

                    except Exception as e:
                        print(f"Error reading file {full_path}: {e}")

        return {
            "status": "success",
            "repo_path": repo_path,
            "files_indexed": total_files,
            "chunks_indexed": total_chunks,
            "secrets_redacted": total_secrets_redacted
        }

    def search_context(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        return vector_store.search(query, top_k=top_k)

rag_service = RAGIngestionService()
