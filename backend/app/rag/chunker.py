import re
from typing import List, Dict, Any

class CodeChunk:
    def __init__(self, file_path: str, chunk_type: str, name: str, start_line: int, end_line: int, content: str):
        self.file_path = file_path
        self.chunk_type = chunk_type  # function, class, route, section, module
        self.name = name
        self.start_line = start_line
        self.end_line = end_line
        self.content = content

    def to_dict(self) -> Dict[str, Any]:
        return {
            "file_path": self.file_path,
            "chunk_type": self.chunk_type,
            "name": self.name,
            "start_line": self.start_line,
            "end_line": self.end_line,
            "content": self.content
        }

class CodeAwareChunker:
    """
    Intelligent structural code chunker that identifies functions, classes,
    API routes, and documentation headers rather than splitting blindly.
    """
    
    # Regex patterns for code structures across JS/TS/Python/SQL
    JS_TS_FUNCTION = re.compile(r'^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(|^(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(', re.MULTILINE)
    JS_TS_CLASS = re.compile(r'^(?:export\s+)?class\s+([a-zA-Z0-9_$]+)', re.MULTILINE)
    JS_TS_ROUTE = re.compile(r'(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]', re.MULTILINE)
    
    PY_FUNCTION = re.compile(r'^\s*(?:async\s+)?def\s+([a-zA-Z0-9_]+)\s*\(', re.MULTILINE)
    PY_CLASS = re.compile(r'^\s*class\s+([a-zA-Z0-9_]+)', re.MULTILINE)
    PY_ROUTE = re.compile(r'@(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]', re.MULTILINE)
    
    MD_HEADER = re.compile(r'^(#{1,3})\s+(.+)$', re.MULTILINE)

    def chunk_file(self, file_path: str, content: str) -> List[CodeChunk]:
        lines = content.splitlines()
        if not lines:
            return []

        chunks = []
        ext = file_path.rsplit(".", 1)[-1].lower() if "." in file_path else ""

        if ext in ["js", "jsx", "ts", "tsx"]:
            chunks = self._chunk_js_ts(file_path, lines, content)
        elif ext == "py":
            chunks = self._chunk_python(file_path, lines, content)
        elif ext in ["md", "txt"]:
            chunks = self._chunk_markdown(file_path, lines, content)
        else:
            # Fallback to smart sliding block chunking for SQL, YAML, JSON, config
            chunks = self._chunk_blocks(file_path, lines)

        # Fallback if no specific structures identified
        if not chunks:
            chunks = self._chunk_blocks(file_path, lines)

        return chunks

    def _chunk_js_ts(self, file_path: str, lines: List[str], full_content: str) -> List[CodeChunk]:
        chunks = []
        current_chunk_type = "module"
        current_name = file_path.rsplit("/", 1)[-1]
        start_line = 1
        chunk_buffer = []

        for i, line in enumerate(lines, 1):
            # Check for route matches
            route_match = self.JS_TS_ROUTE.search(line)
            func_match = self.JS_TS_FUNCTION.search(line)
            class_match = self.JS_TS_CLASS.search(line)

            if route_match or func_match or class_match:
                if chunk_buffer and len(chunk_buffer) > 3:
                    chunks.append(CodeChunk(
                        file_path=file_path,
                        chunk_type=current_chunk_type,
                        name=current_name,
                        start_line=start_line,
                        end_line=i - 1,
                        content="\n".join(chunk_buffer)
                    ))
                    chunk_buffer = []

                start_line = i
                if route_match:
                    current_chunk_type = "route"
                    current_name = f"{route_match.group(1).upper()} {route_match.group(2)}"
                elif class_match:
                    current_chunk_type = "class"
                    current_name = class_match.group(1)
                elif func_match:
                    current_chunk_type = "function"
                    current_name = func_match.group(1) or func_match.group(2) or "anonymous"

            chunk_buffer.append(line)

        if chunk_buffer:
            chunks.append(CodeChunk(
                file_path=file_path,
                chunk_type=current_chunk_type,
                name=current_name,
                start_line=start_line,
                end_line=len(lines),
                content="\n".join(chunk_buffer)
            ))

        return chunks

    def _chunk_python(self, file_path: str, lines: List[str], full_content: str) -> List[CodeChunk]:
        chunks = []
        current_chunk_type = "module"
        current_name = file_path.rsplit("/", 1)[-1]
        start_line = 1
        chunk_buffer = []

        for i, line in enumerate(lines, 1):
            route_match = self.PY_ROUTE.search(line)
            func_match = self.PY_FUNCTION.search(line)
            class_match = self.PY_CLASS.search(line)

            if (route_match or func_match or class_match) and not line.startswith(" ") and not line.startswith("\t"):
                if chunk_buffer and len(chunk_buffer) > 2:
                    chunks.append(CodeChunk(
                        file_path=file_path,
                        chunk_type=current_chunk_type,
                        name=current_name,
                        start_line=start_line,
                        end_line=i - 1,
                        content="\n".join(chunk_buffer)
                    ))
                    chunk_buffer = []

                start_line = i
                if route_match:
                    current_chunk_type = "route"
                    current_name = f"{route_match.group(1).upper()} {route_match.group(2)}"
                elif class_match:
                    current_chunk_type = "class"
                    current_name = class_match.group(1)
                elif func_match:
                    current_chunk_type = "function"
                    current_name = func_match.group(1)

            chunk_buffer.append(line)

        if chunk_buffer:
            chunks.append(CodeChunk(
                file_path=file_path,
                chunk_type=current_chunk_type,
                name=current_name,
                start_line=start_line,
                end_line=len(lines),
                content="\n".join(chunk_buffer)
            ))

        return chunks

    def _chunk_markdown(self, file_path: str, lines: List[str], full_content: str) -> List[CodeChunk]:
        chunks = []
        current_name = file_path.rsplit("/", 1)[-1]
        start_line = 1
        chunk_buffer = []

        for i, line in enumerate(lines, 1):
            header_match = self.MD_HEADER.search(line)
            if header_match:
                if chunk_buffer:
                    chunks.append(CodeChunk(
                        file_path=file_path,
                        chunk_type="section",
                        name=current_name,
                        start_line=start_line,
                        end_line=i - 1,
                        content="\n".join(chunk_buffer)
                    ))
                    chunk_buffer = []
                start_line = i
                current_name = header_match.group(2).strip()

            chunk_buffer.append(line)

        if chunk_buffer:
            chunks.append(CodeChunk(
                file_path=file_path,
                chunk_type="section",
                name=current_name,
                start_line=start_line,
                end_line=len(lines),
                content="\n".join(chunk_buffer)
            ))

        return chunks

    def _chunk_blocks(self, file_path: str, lines: List[str], block_size: int = 40) -> List[CodeChunk]:
        chunks = []
        total_lines = len(lines)
        base_name = file_path.rsplit("/", 1)[-1]

        for i in range(0, total_lines, block_size):
            start = i + 1
            end = min(i + block_size, total_lines)
            chunk_content = "\n".join(lines[i:end])
            chunks.append(CodeChunk(
                file_path=file_path,
                chunk_type="block",
                name=f"{base_name} L{start}-{end}",
                start_line=start,
                end_line=end,
                content=chunk_content
            ))
        return chunks

chunker = CodeAwareChunker()
