from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.agents.master_agent import master_agent

router = APIRouter(prefix="/api/investigate", tags=["AI Investigation"])

class InvestigationRequest(BaseModel):
    error_message: str
    stack_trace: Optional[str] = None
    endpoint: Optional[str] = None
    log_file: Optional[str] = None
    git_commits: Optional[List[Dict[str, Any]]] = None

@router.post("")
def run_error_investigation(req: InvestigationRequest):
    if not req.error_message and not req.stack_trace:
        raise HTTPException(status_code=400, detail="Must provide error message or stack trace")

    context = {
        "error_message": req.error_message,
        "stack_trace": req.stack_trace or "",
        "endpoint": req.endpoint or "",
        "logs": req.log_file or "",
        "git_commits": req.git_commits or []
    }

    report = master_agent.investigate(context)
    return report
