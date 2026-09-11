from fastapi import APIRouter
from app.evaluation.runner import eval_runner

router = APIRouter(prefix="/api/eval", tags=["AI Evaluation"])

@router.get("/metrics")
def get_evaluation_metrics():
    return eval_runner.run_benchmark()
