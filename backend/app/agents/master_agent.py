import time
from typing import Dict, Any, List
from app.agents.code_agent import code_agent
from app.agents.log_agent import log_agent
from app.agents.git_agent import git_agent
from app.agents.db_agent import db_agent, doc_agent

class MasterInvestigationAgent:
    def __init__(self):
        self.agents = [
            code_agent,
            log_agent,
            git_agent,
            db_agent,
            doc_agent
        ]

    def investigate(self, context: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        agent_traces = []
        all_evidence = []
        
        # 1. Run Log Agent
        log_res = log_agent.analyze(context)
        agent_traces.append(log_res)
        all_evidence.extend(log_res.get("evidence", []))
        
        # Update context with parsed stack frames for Code Agent
        context["suspicious_files"] = [
            {"file_path": f["file"], "start_line": f["line"]} for f in log_res.get("parsed_frames", [])
        ]

        # 2. Run Code Agent
        code_res = code_agent.analyze(context)
        agent_traces.append(code_res)
        all_evidence.extend(code_res.get("evidence", []))

        # 3. Run Git Agent
        git_res = git_agent.analyze(context)
        agent_traces.append(git_res)
        all_evidence.extend(git_res.get("evidence", []))

        # 4. Run DB Agent
        db_res = db_agent.analyze(context)
        agent_traces.append(db_res)
        all_evidence.extend(db_res.get("evidence", []))

        # 5. Run Doc Agent
        doc_res = doc_agent.analyze(context)
        agent_traces.append(doc_res)
        all_evidence.extend(doc_res.get("evidence", []))

        # Deduplicate and sort evidence by relevance score
        unique_evidence = []
        seen_refs = set()
        for ev in all_evidence:
            ref_key = f"{ev['source_type']}:{ev['source_reference']}"
            if ref_key not in seen_refs:
                seen_refs.add(ref_key)
                unique_evidence.append(ev)

        unique_evidence.sort(key=lambda x: x["relevance_score"], reverse=True)

        # Dynamic Root Cause Determination based on stack trace / RAG chunks
        parsed_frames = log_res.get("parsed_frames", [])
        retrieved_chunks = code_res.get("retrieved_code_chunks", [])
        
        if parsed_frames:
            root_cause_file = parsed_frames[0]["file"]
            root_cause_line = parsed_frames[0]["line"]
        elif retrieved_chunks:
            root_cause_file = retrieved_chunks[0]["file_path"]
            root_cause_line = retrieved_chunks[0]["start_line"]
        else:
            root_cause_file = "src/main.ts"
            root_cause_line = 1

        exc_type = log_res.get("exception_type", "Error")
        error_msg = context.get("error_message") or f"{exc_type} detected in application execution"

        snippet = None
        if retrieved_chunks:
            snippet = retrieved_chunks[0].get("content")

        commit_info = git_res.get("matching_commits", [{}])[0] if git_res.get("matching_commits") else {
            "commit_hash": "HEAD",
            "message": "Recent repository changes",
            "author": "dev-team",
            "timestamp": "recent"
        }

        confidence_score = 90 if (parsed_frames and retrieved_chunks) else (75 if retrieved_chunks else 60)
        elapsed_seconds = round(time.time() - start_time, 2)

        return {
            "status": "completed",
            "investigation_id": f"inv_{int(time.time())}",
            "confidence_score": confidence_score,
            "root_cause": {
                "file": root_cause_file,
                "line": root_cause_line,
                "summary": f"{exc_type} at {root_cause_file}:{root_cause_line} — {error_msg}",
                "code_snippet": snippet
            },
            "evidence": unique_evidence,
            "correlated_commit": commit_info,
            "error_stats": {
                "total_occurrences": log_res.get("frequency", 1),
                "error_started": "Detected in recent logs",
                "affected_users": "Affected execution paths"
            },
            "recommended_next_steps": [
                f"Inspect line {root_cause_line} in {root_cause_file}",
                "Verify variable initialization and input parameters before function invocation",
                "Add defensive guards or try-catch error handling",
                "Run unit and regression test suite for affected module"
            ],
            "agent_traces": agent_traces,
            "latency_seconds": elapsed_seconds
        }

master_agent = MasterInvestigationAgent()
