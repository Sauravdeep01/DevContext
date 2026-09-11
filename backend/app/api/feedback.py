from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time

router = APIRouter(prefix="/api/feedback", tags=["Developer Feedback"])

FEEDBACK_STORE: List[Dict[str, Any]] = []

class FeedbackRequest(BaseModel):
    investigation_id: str
    rating: str # positive, negative
    feedback_type: Optional[str] = None # wrong_root_cause, wrong_evidence, missing_context, incorrect_recommendation
    comment: Optional[str] = None

@router.post("")
def submit_feedback(req: FeedbackRequest):
    entry = {
        "id": f"fb_{len(FEEDBACK_STORE) + 1}",
        "investigation_id": req.investigation_id,
        "rating": req.rating,
        "feedback_type": req.feedback_type,
        "comment": req.comment,
        "created_at": time.time()
    }
    FEEDBACK_STORE.append(entry)
    return {
        "status": "success",
        "message": "Feedback recorded for evaluation tuning.",
        "entry": entry
    }

@router.get("/list")
def list_feedback():
    return {
        "total_feedback": len(FEEDBACK_STORE),
        "entries": FEEDBACK_STORE
    }
