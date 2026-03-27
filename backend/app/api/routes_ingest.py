from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List

from app.schemas.ingest import IngestResponse
from app.services import ingest_service
from app.utils.file_utils import save_upload_file, get_upload_path
from app.utils.validation_utils import validate_file_extension
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post("/ingest", response_model=IngestResponse, tags=["Ingestion"])
async def ingest_topology(files: List[UploadFile] = File(...)):
    """
    Upload one or more CSV topology dataset files for ingestion.

    Supported datasets: queue_managers, queues, applications, channels, relationships, metadata.

    The engine will:
    - Intelligently classify each file by filename and column patterns
    - Normalize heterogeneous column names into a canonical schema
    - Validate required fields and detect data quality issues
    - Build a canonical topology model
    - Construct a NetworkX topology graph
    - Return structured inventory, graph stats, warnings, and a data preview
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    saved: list[tuple[str, str]] = []
    rejected: list[str] = []

    for upload in files:
        filename = upload.filename or "unnamed.csv"

        if not validate_file_extension(filename):
            rejected.append(f"'{filename}' rejected — only CSV files are accepted")
            logger.warning("Rejected non-CSV upload: %s", filename)
            continue

        destination = get_upload_path(filename)
        try:
            await save_upload_file(upload, destination)
            saved.append((filename, destination))
        except HTTPException:
            raise
        except Exception as e:
            rejected.append(f"'{filename}' could not be saved: {e}")
            logger.error("Failed to save upload '%s': %s", filename, e)

    if not saved:
        raise HTTPException(
            status_code=400,
            detail=f"No valid CSV files were processed. Rejected: {rejected}",
        )

    result = ingest_service.ingest_files(saved)

    if rejected:
        result["warnings"] = rejected + result.get("warnings", [])

    return IngestResponse(**result)


@router.get("/ingest/datasets", tags=["Ingestion"])
def list_datasets():
    """List all dataset IDs currently held in the in-memory topology registry."""
    ids = ingest_service.list_datasets()
    return {"dataset_ids": ids, "count": len(ids)}


@router.get("/ingest/datasets/{dataset_id}", tags=["Ingestion"])
def get_dataset(dataset_id: str):
    """Retrieve summary information for a previously ingested topology dataset."""
    summary = ingest_service.get_dataset_summary(dataset_id)
    if not summary:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    return summary
