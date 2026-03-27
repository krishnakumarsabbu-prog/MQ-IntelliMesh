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

## Recommended Workflow

### Step 1 — Ingest topology CSV files

```bash
curl -X POST http://localhost:8000/api/ingest \
  -F "files=@queue_managers.csv" \
  -F "files=@queues.csv" \
  -F "files=@applications.csv" \
  -F "files=@channels.csv" \
  -F "files=@relationships.csv"
```

### Step 2 — Run as-is analysis

```bash
curl http://localhost:8000/api/analyze
```

Or with a specific dataset ID:

```bash
curl "http://localhost:8000/api/analyze?dataset_id=A1B2C3D4"
```

The analysis engine produces structured findings covering:

| Check | Category |
|-------|----------|
| Multi-QM application connections | Policy Violation |
| Orphan queues (no producer/consumer) | Topology Waste |
| Unused / unmapped Queue Managers | Simplification Opportunity / Governance Drift |
| Redundant channels between same QM pair | Topology Waste |
| Excessive routing hop depth | Routing Risk |
| Fan-in / fan-out hotspots | Operational Risk |
| Directed cycles in topology graph | Structural Risk |
| Unresolved cross-dataset references | Data Quality |
| Policy drift and application concentration | Governance Drift |
| High-centrality single points of failure | Operational Risk |

---

### Step 3 — Generate target-state topology

```bash
curl -X POST http://localhost:8000/api/transform \
  -H "Content-Type: application/json" \
  -d '{}'
```

Or with a specific dataset:

```bash
curl -X POST http://localhost:8000/api/transform \
  -H "Content-Type: application/json" \
  -d '{"dataset_id": "A1B2C3D4"}'
```

**Generated target objects:**

- `LQ.<consumer_app>.<queue>` — local queues for consumers
- `RQ.<consumer_app>.<queue>` — remote queues for producers
- `XMIT.<from_qm>.<to_qm>` — transmission queues
- `<fromQM>.<toQM>.SDR` — sender channels
- `<toQM>.<fromQM>.RCVR` — receiver channels

The response includes:
- `target_topology` — all generated MQ objects
- `decisions` — explainable decision record for every transformation action
- `validation` — compliance checks with pass/fail/warning breakdown
- `complexity` — before/after MTCS score with dimension-level breakdown and reduction percentage

---

## Implementation Phases

| Phase | Scope |
|-------|-------|
| 7A | Backend skeleton, routes, schemas, service stubs |
| 7B | CSV ingestion + canonical model + graph builder |
| 7C | Findings engine — 10 check categories, health scoring, hotspot detection |
| 7D (current) | Target-state transformation + MTCS complexity scoring + validation engine |
| 7E | Explainability + decision trace |
| 7F | Artifact export generation |

---

## Environment Variables

Create a `.env` file in `backend/` to override defaults:

```env
ENVIRONMENT=development
DEBUG=true
```
