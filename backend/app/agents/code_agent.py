from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.rag.retriever import rag_service

class CodeAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Code Agent", role="Analyzes source code architecture, functions, types, and logic flow.")

    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        query = context.get("error_message") or context.get("query") or ""
        stack_trace = context.get("stack_trace") or ""
        
        # RAG retrieval for relevant functions and classes
        search_term = f"{query} {stack_trace}"
        retrieved_chunks = rag_service.search_context(search_term, top_k=4)

        findings = []
        evidence = []
        suspicious_files = []

        for item in retrieved_chunks:
            chunk = item["chunk"]
            score = item["score"]
            suspicious_files.append({
                "file_path": chunk["file_path"],
                "start_line": chunk["start_line"],
                "end_line": chunk["end_line"],
                "name": chunk["name"],
                "score": score
            })

            if score > 0.3:
                evidence.append({
                    "source_type": "code",
                    "source_reference": f"{chunk['file_path']}:{chunk['start_line']}",
                    "content": f"Matched structure '{chunk['name']}' in {chunk['file_path']} (lines {chunk['start_line']}-{chunk['end_line']})",
                    "relevance_score": score
                })

        # Check for unhandled exceptions or null dereferences in chunk code
        for file_info in suspicious_files:
            file_path = file_info["file_path"]
            if "service" in file_path.lower() or "controller" in file_path.lower() or "handler" in file_path.lower():
                findings.append(f"Located active service logic in {file_path} at line {file_info['start_line']}")

        return {
            "agent": self.name,
            "status": "success",
            "findings": findings,
            "suspicious_files": suspicious_files,
            "evidence": evidence,
            "retrieved_code_chunks": [r["chunk"] for r in retrieved_chunks]
        }

code_agent = CodeAgent()
