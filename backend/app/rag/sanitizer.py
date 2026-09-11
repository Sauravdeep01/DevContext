import re
from typing import List, Tuple
from app.config import SECRET_PATTERNS

class SecretSanitizer:
    def __init__(self, patterns: List[str] = None):
        self.patterns = patterns or SECRET_PATTERNS
        self.compiled_patterns = [re.compile(p) for p in self.patterns]

    def sanitize(self, content: str) -> Tuple[str, int]:
        """
        Scans content for sensitive credentials and replaces them with [REDACTED].
        Returns (sanitized_content, total_secrets_found).
        """
        if not content:
            return content, 0

        sanitized = content
        count = 0

        for pattern in self.compiled_patterns:
            matches = list(pattern.finditer(sanitized))
            if matches:
                count += len(matches)
                # Handle pattern groups vs full match
                def replace_func(m):
                    if m.groups() and m.group(1):
                        full = m.group(0)
                        secret_val = m.group(1)
                        return full.replace(secret_val, "[REDACTED_SECRET]")
                    return "[REDACTED_SECRET]"
                
                sanitized = pattern.sub(replace_func, sanitized)

        return sanitized, count

sanitizer = SecretSanitizer()
