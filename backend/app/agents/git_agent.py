import subprocess
from typing import Dict, Any, List
from app.agents.base import BaseAgent

class GitAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Git Agent", role="Correlates commit history, recent diffs, author changes, and deployment timelines.")

    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        git_history = context.get("git_commits", [])
        suspicious_files = [f["file_path"] for f in context.get("suspicious_files", [])]
        repo_path = context.get("repo_path")

        # Try executing real git log if repo_path is provided
        if not git_history and repo_path:
            git_history = self._fetch_real_git_commits(repo_path)

        matching_commits = []
        evidence = []
        high_correlation = False

        for commit in git_history:
            changed = commit.get("changed_files", [])
            overlap = [f for f in changed if any(s.endswith(f) or f.endswith(s) for s in suspicious_files)]
            
            if overlap:
                high_correlation = True
                matching_commits.append(commit)
                evidence.append({
                    "source_type": "git",
                    "source_reference": f"commit:{commit.get('commit_hash', 'recent')}",
                    "content": f"Commit {commit.get('commit_hash', '')} by {commit.get('author', 'author')} ('{commit.get('message', '')}') modified {', '.join(changed)}",
                    "relevance_score": 0.94
                })

        return {
            "agent": self.name,
            "status": "success",
            "matching_commits": matching_commits,
            "correlation_rating": "HIGH" if high_correlation else ("MEDIUM" if git_history else "NONE"),
            "evidence": evidence,
            "findings": [
                f"Correlated commit: {matching_commits[0]['commit_hash']} ('{matching_commits[0]['message']}')" if matching_commits else "No direct commit overlap detected for suspicious files.",
                f"Correlation rating: {'HIGH' if high_correlation else ('MEDIUM' if git_history else 'NONE')}"
            ]
        }

    def _fetch_real_git_commits(self, repo_path: str) -> List[Dict[str, Any]]:
        commits = []
        try:
            cmd = ["git", "log", "-n", "5", "--pretty=format:%h|%an|%cr|%s", "--name-only"]
            res = subprocess.run(cmd, cwd=repo_path, capture_output=True, text=True, timeout=5)
            if res.returncode == 0 and res.stdout.strip():
                blocks = res.stdout.strip().split("\n\n")
                for block in blocks:
                    lines = [l.strip() for l in block.split("\n") if l.strip()]
                    if not lines:
                        continue
                    header = lines[0]
                    parts = header.split("|")
                    if len(parts) >= 4:
                        changed_files = lines[1:]
                        commits.append({
                            "commit_hash": parts[0],
                            "author": parts[1],
                            "timestamp": parts[2],
                            "message": parts[3],
                            "changed_files": changed_files
                        })
        except Exception:
            pass
        return commits

git_agent = GitAgent()
