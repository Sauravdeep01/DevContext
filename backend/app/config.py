import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
CURRENT_ACTIVE_REPO = None


SECRET_PATTERNS = [
    r"sk-[a-zA-Z0-9]{32,}",                # OpenAI API Key pattern
    r"ghp_[a-zA-Z0-9]{36}",                # GitHub Personal Access Token
    r"gho_[a-zA-Z0-9]{36}",                # GitHub OAuth Access Token
    r"eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}", # JWT Token
    r"postgres(?:ql)?://[^:]+:[^@]+@[^/]+/[^\s'\"]+",  # Postgres connection string
    r"mysql://[^:]+:[^@]+@[^/]+/[^\s'\"]+",             # MySQL connection string
    r"mongodb(?:\+srv)?://[^:]+:[^@]+@[^/]+/[^\s'\"]+", # MongoDB URI
    r"(?i)(?:password|secret|api_key|access_token|private_key)\s*[:=]\s*[\"']?([^\"'\s]+)[\"']?",
]
