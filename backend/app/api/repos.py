import os
import re
import subprocess
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.rag.retriever import rag_service
from app.config import BASE_DIR

CLONED_REPOS_DIR = BASE_DIR / "cloned_repos"
CLONED_REPOS_DIR.mkdir(exist_ok=True)

router = APIRouter(prefix="/api/repos", tags=["Repositories"])

class IndexRepoRequest(BaseModel):
    repo_path: Optional[str] = None
    repo_url: Optional[str] = None

def resolve_repo_path(raw_input: str) -> str:
    cleaned = raw_input.strip()
    
    # Check if input is a GitHub URL
    if "github.com" in cleaned or cleaned.startswith("http://") or cleaned.startswith("https://"):
        pattern = r'https?://github\.com/([^/]+)/([^/\?#]+)(?:/tree/[^/]+/(.+))?'
        match = re.match(pattern, cleaned)
        if not match:
            # Fallback simple split for github urls
            parts = cleaned.replace("https://github.com/", "").replace("http://github.com/", "").split("/")
            if len(parts) >= 2:
                owner, repo = parts[0], parts[1].replace(".git", "")
                subpath = "/".join(parts[4:]) if len(parts) >= 5 and parts[2] == "tree" else ""
            else:
                raise HTTPException(status_code=400, detail="Invalid GitHub URL format. Use format: https://github.com/owner/repository")
        else:
            owner = match.group(1)
            repo = match.group(2).replace(".git", "")
            subpath = match.group(3) or ""

        clone_target = CLONED_REPOS_DIR / f"{owner}_{repo}"
        repo_git_url = f"https://github.com/{owner}/{repo}.git"

        if not clone_target.exists():
            print(f"[INFO] Cloning GitHub repository {repo_git_url} to {clone_target}...")
            cmd = ["git", "clone", "--depth", "1", repo_git_url, str(clone_target)]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            if res.returncode != 0:
                raise HTTPException(status_code=400, detail=f"Failed to clone GitHub repo: {res.stderr.strip() or res.stdout.strip()}")
        else:
            print(f"[INFO] Repository {owner}/{repo} already cloned. Fetching updates...")
            try:
                subprocess.run(["git", "pull"], cwd=str(clone_target), capture_output=True, text=True, timeout=30)
            except Exception:
                pass

        final_path = clone_target / subpath if subpath else clone_target
        if not final_path.exists():
            raise HTTPException(status_code=400, detail=f"Sub-directory '{subpath}' does not exist inside repository '{owner}/{repo}'")

        return str(final_path).replace("\\", "/")
    
    # Local directory path
    local_path = cleaned.replace("\\", "/")
    if not os.path.exists(local_path):
        raise HTTPException(status_code=400, detail=f"Local directory path does not exist: {local_path}")
    
    return local_path

@router.get("/list")
def list_available_repos():
    return {
        "status": "success",
        "cloned_repositories": [d.name for d in CLONED_REPOS_DIR.iterdir() if d.is_dir()]
    }

@router.post("/index")
def index_repository(req: IndexRepoRequest):
    raw_path = req.repo_path or req.repo_url

    if not raw_path or not raw_path.strip():
        raise HTTPException(status_code=400, detail="Please provide a valid local folder path or GitHub URL (e.g., 'https://github.com/owner/repo')")

    try:
        resolved_path = resolve_repo_path(raw_path)
        res = rag_service.index_directory(resolved_path)
        res["resolved_path"] = resolved_path
        return res
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
