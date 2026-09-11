from typing import Dict, Any
from app.agents.base import BaseAgent
from app.rag.retriever import rag_service

class DatabaseAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Database Agent", role="Inspects database schemas, foreign key constraints, indexes, and queries.")

    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        query = (context.get("error_message") or "") + " " + (context.get("stack_trace") or "")
        
        # Search RAG for SQL or schema files
        results = rag_service.search_context(query, top_k=3)
        sql_chunks = [r["chunk"] for r in results if r["chunk"]["file_path"].endswith(".sql") or "schema" in r["chunk"]["file_path"].lower()]

        evidence = []
        findings = []

        if sql_chunks:
            for chunk in sql_chunks:
                evidence.append({
                    "source_type": "database",
                    "source_reference": f"{chunk['file_path']}:{chunk['start_line']}",
                    "content": f"Matched database schema structure '{chunk['name']}' in {chunk['file_path']}",
                    "relevance_score": 0.85
                })
                findings.append(f"Located database schema definition in {chunk['file_path']}")
        else:
            findings.append("No active database schema anomalies detected in vector store.")

        return {
            "agent": self.name,
            "status": "success",
            "findings": findings,
            "evidence": evidence
        }

class DocAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Documentation Agent", role="Scans README files, API specs, and project documentation.")

    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        query = (context.get("error_message") or "") + " " + (context.get("query") or "")
        
        results = rag_service.search_context(query, top_k=3)
        doc_chunks = [r["chunk"] for r in results if r["chunk"]["file_path"].endswith(".md") or "doc" in r["chunk"]["file_path"].lower()]

        evidence = []
        findings = []

        if doc_chunks:
            for chunk in doc_chunks:
                evidence.append({
                    "source_type": "doc",
                    "source_reference": f"{chunk['file_path']}:{chunk['start_line']}",
                    "content": f"Matched project documentation section '{chunk['name']}' in {chunk['file_path']}",
                    "relevance_score": 0.80
                })
                findings.append(f"Referenced documentation section '{chunk['name']}' in {chunk['file_path']}")
        else:
            findings.append("Project documentation scanned.")

        return {
            "agent": self.name,
            "status": "success",
            "findings": findings,
            "evidence": evidence
        }

db_agent = DatabaseAgent()
doc_agent = DocAgent()
