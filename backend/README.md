# MQ IntelliMesh Intelligence Engine

FastAPI backend for the MQ IntelliMesh platform.
Canonicalizes heterogeneous MQ inventory into a normalized topology model for intelligent reasoning and transformation.

---

## Project Structure

```
backend/
  app/
    main.py               FastAPI application entry point
    api/                  Route modules (one per domain)
    core/                 Config, constants, logging
    models/               Domain models (Application, QueueManager, Queue, Channel, CanonicalTopologyModel)
    schemas/              Pydantic request/response schemas
    services/             Business logic service layer
    utils/
      file_utils.py       Upload saving, directory helpers
      naming_utils.py     Header normalization, dataset classification, canonical field mapping
      validation_utils.py Required field checks, duplicate detection, cross-reference validation
      graph_utils.py      NetworkX topology graph builder and summary helpers
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
| http://localhost:8000/api/ingest | POST — upload CSV topology datasets |
| http://localhost:8000/api/ingest/datasets | GET — list ingested dataset IDs |
| http://localhost:8000/api/ingest/datasets/{id} | GET — retrieve dataset summary |
| http://localhost:8000/api/analyze | GET — run as-is findings engine |
| http://localhost:8000/api/transform | POST — generate target-state topology |
| http://localhost:8000/api/complexity | GET — compute MTCS score |
| http://localhost:8000/api/explain | GET — fetch decision explanation |
| http://localhost:8000/api/export | GET/POST — generate delivery artifacts |

---

## Testing POST /api/ingest

### Using curl (multiple files):

```bash
curl -X POST http://localhost:8000/api/ingest \
  -F "files=@queue_managers.csv" \
  -F "files=@queues.csv" \
  -F "files=@applications.csv" \
  -F "files=@channels.csv" \
  -F "files=@relationships.csv"
```

### Using the Swagger UI:

1. Open http://localhost:8000/docs
2. Find `POST /api/ingest`
3. Click "Try it out"
4. Upload one or more CSV files using the file picker
5. Execute

---

## Supported CSV Datasets

| Dataset | Key Columns | Classification Hints |
|---------|-------------|---------------------|
| `queue_managers.csv` | `qm_name`, `qm_type`, `region`, `environment` | filename: qm, managers; columns: qm_name, queue_manager |
| `queues.csv` | `queue_name`, `owning_qm`, `queue_type` | filename: queue; columns: queue_name, owning_qm |
| `applications.csv` | `app_id`, `connected_qm`, `role` | filename: app; columns: app_id, application |
| `channels.csv` | `channel_name`, `from_qm`, `to_qm`, `channel_type` | filename: channel; columns: channel_name, from_qm |
| `relationships.csv` | `producer_app`, `consumer_app`, `queue_name` | filename: relationship, flow; columns: producer, consumer |
| `metadata.csv` | `region`, `neighborhood`, `environment` | filename: metadata, meta |

### Schema Normalization

Column names are automatically normalized regardless of source naming conventions.

Examples of accepted variations:

| Canonical Field | Accepted Variations |
|-----------------|---------------------|
| `qm_name` | `qm`, `queue_manager`, `queue_manager_name`, `qmgr` |
| `queue_name` | `queue`, `name` |
| `owning_qm` | `owner_qm`, `queue_manager`, `qm_name` |
| `from_qm` | `source_qm`, `local_qm` |
| `to_qm` | `target_qm`, `remote_qm` |
| `producer_app` | `producer`, `source_app` |
| `consumer_app` | `consumer`, `target_app` |

---

## Implementation Phases

| Phase | Scope |
|-------|-------|
| 7A | Backend skeleton, routes, schemas, service stubs |
| 7B (current) | CSV ingestion + canonical model + graph builder |
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
