# MQ IntelliMesh Intelligence Engine

FastAPI backend for the MQ IntelliMesh platform.
Provides the intelligence pipeline for CSV ingestion, topology analysis, target-state transformation, complexity scoring, explainability, and artifact export.

---

## Project Structure

```
backend/
  app/
    main.py               FastAPI application entry point
    api/                  Route modules (one per domain)
    core/                 Config, constants, logging
    models/               Domain models (Application, QueueManager, Queue, Channel)
    schemas/              Pydantic request/response schemas
    services/             Business logic service layer
    utils/                File, naming, and validation helpers
    data/
      uploads/            Uploaded CSV datasets
      outputs/            Generated export artifacts
  requirements.txt
  README.md
```

---

## Setup

### 1. Create a virtual environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the development server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Key URLs

| URL | Description |
|-----|-------------|
| http://localhost:8000/ | Root — service name and status |
| http://localhost:8000/health | Health check |
| http://localhost:8000/version | Version and environment |
| http://localhost:8000/docs | Interactive Swagger UI |
| http://localhost:8000/redoc | ReDoc API documentation |
| http://localhost:8000/api/ingest | POST — upload CSV topology dataset |
| http://localhost:8000/api/analyze | GET — run as-is findings engine |
| http://localhost:8000/api/transform | POST — generate target-state topology |
| http://localhost:8000/api/complexity | GET — compute MTCS score |
| http://localhost:8000/api/explain | GET — fetch decision explanation |
| http://localhost:8000/api/export | GET/POST — generate delivery artifacts |

---

## Implementation Phases

| Phase | Scope |
|-------|-------|
| 7A (current) | Backend skeleton, routes, schemas, service stubs |
| 7B | CSV ingestion + graph builder (pandas + networkx) |
| 7C | Findings engine — compliance rules, orphan detection |
| 7D | Target-state transformation engine + MTCS scoring |
| 7E | Explainability + decision trace |
| 7F | Artifact export generation |

---

## Environment Variables

Create a `.env` file in `backend/` to override defaults:

```env
ENVIRONMENT=development
DEBUG=true
```
