# DevContext — AI-Powered Developer Investigation Platform

**DevContext** is an AI-powered developer productivity and debugging platform that helps engineering teams investigate real application problems by connecting their repository codebase, application error logs, Git history, database schemas, and documentation.

Instead of acting as a generic ChatGPT chatbot, DevContext performs evidence-backed investigations answering questions like:
- **"Why is this API failing?"**
- **"What changed before this error started?"**
- **"Where is authentication implemented?"**
- **"What could this PR break?"**

---

## 🌟 Key Features

1. **GitHub & Local Codebase Indexing**:
   - Indexes local project folders or public GitHub repository URLs (including subpaths like `/tree/main/client`).
   - Structural AST-aware code chunking around functions, classes, API routes, and markdown headers.
   - Built-in Secret Redactor automatically sanitizes API keys (`sk-`), GitHub tokens (`ghp_`), passwords, and database URIs to `[REDACTED_SECRET]`.

2. **AI Error Investigator (Multi-Agent Engine)**:
   - Coordinates 5 specialized sub-agents (`LogAgent`, `CodeAgent`, `GitAgent`, `DatabaseAgent`, `DocAgent`) synthesized by `MasterInvestigationAgent`.
   - Produces evidence-backed reports with Likely Root Cause (`file.ts:142`), Confidence Score (91%), Supporting Evidence checklist, Correlated Commit, and Next Steps.
   - Clickable line links open an interactive Code Inspector Modal.

3. **Ask Your Codebase (RAG Layer)**:
   - Perform semantic architectural Q&A against indexed code and documentation chunks.

4. **"What Changed?" Git Intelligence Timeline**:
   - Correlates healthy baseline states against deployment commit events and error log spikes.
   - Enforces correlation vs certainty guardrails.

5. **Pull Request Risk Analyzer**:
   - Evaluates PR diffs against code dependencies to predict affected features, risk rating badges (**HIGH RISK**), and targeted regression test suites.

6. **AI Evaluation System & Metrics Dashboard**:
   - Evaluates ground-truth debugging scenarios to measure Root Cause Accuracy, Evidence Relevance, Retrieval Accuracy, False Positive Rate, and Latency.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Glassmorphism UI
- **Backend**: Python 3.11, FastAPI, Pydantic, Uvicorn, Scikit-Learn (TF-IDF & Cosine Vector Store), Git CLI
- **DevOps**: Docker, Docker Compose, Nginx

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Run Backend Server
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`

### 2. Run Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
- Web App: `http://localhost:3000`

---

## 🐳 Docker Deployment

To run DevContext in production containers:

```bash
docker-compose up --build -d
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 📜 License
MIT License. Built for scalable AI-native developer tooling.
