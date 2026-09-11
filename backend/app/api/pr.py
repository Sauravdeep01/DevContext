from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(prefix="/api/pr", tags=["PR Risk Analyzer"])

class PRAnalysisRequest(BaseModel):
    pr_number: int = 142
    title: str = "Refactor payment subscription logic"
    changed_files: List[str] = ["services/paymentService.ts", "controllers/paymentController.ts"]

@router.post("/analyze")
def analyze_pr_risk(req: PRAnalysisRequest):
    modified = req.changed_files or ["services/paymentService.ts", "controllers/paymentController.ts"]
    
    risk_level = "HIGH" if any("payment" in f.lower() or "auth" in f.lower() for f in modified) else "MEDIUM"

    return {
        "pr_number": req.pr_number,
        "title": req.title,
        "risk_level": risk_level,
        "confidence": 92,
        "modified_files": modified,
        "affected_features": [
            "Checkout flow",
            "Order creation pipeline",
            "Guest payment retry strategy"
        ],
        "risk_summary": "Modifications to paymentService.ts directly affect customer checkout transactions. High risk of unhandled null dereferences for users without stored payment credentials.",
        "recommended_tests": [
            {"test": "Successful payment with default card", "priority": "HIGH"},
            {"test": "Guest payment without stored card", "priority": "CRITICAL"},
            {"test": "Failed payment retry mechanism", "priority": "MEDIUM"},
            {"test": "Duplicate transaction prevention", "priority": "HIGH"}
        ]
    }
