from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.rag.retriever import rag_service

router = APIRouter(prefix="/api/ask", tags=["Ask Codebase"])

class AskCodebaseRequest(BaseModel):
    query: str
    top_k: int = 5

@router.post("")
def ask_codebase(req: AskCodebaseRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    results = rag_service.search_context(req.query, top_k=req.top_k)
    
    chunks = [r["chunk"] for r in results]
    file_list = list(set([c["file_path"] for c in chunks]))

    if not chunks:
        explanation = f"No direct code chunks matched the query '{req.query}'. Please ensure you have indexed your repository folder using the 'Connect & Index Repository' button."
    else:
        explanation = f"Retrieved {len(chunks)} structural code chunks across {len(file_list)} files matching your query '{req.query}':\n\n"
        for i, c in enumerate(chunks[:3], 1):
            explanation += f"{i}. **{c['file_path']}** (lines {c['start_line']}-{c['end_line']}) — *{c['chunk_type']}: {c['name']}*\n"

    return {
        "query": req.query,
        "answer": explanation,
        "relevant_files": file_list,
        "retrieved_chunks": chunks
    }
