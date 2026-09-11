from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api import repos, ask, investigate, git, pr, eval, feedback

app = FastAPI(
    title="DevContext API — AI-Powered Developer Investigation Platform",
    description="Multi-agent RAG engine for investigating codebase errors, stack traces, commits, and PR risks.",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(repos.router)
app.include_router(ask.router)
app.include_router(investigate.router)
app.include_router(git.router)
app.include_router(pr.router)
app.include_router(eval.router)
app.include_router(feedback.router)

@app.on_event("startup")
def startup_event():
    print("[INFO] DevContext Backend starting up... Ready to index real repositories.")



@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "DevContext AI Platform Backend",
        "version": "1.0.0"
    }
