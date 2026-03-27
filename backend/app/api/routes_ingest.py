from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.ingest import IngestResponse
from app.services import ingest_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post("/ingest", response_model=IngestResponse, tags=["Ingestion"])
async def ingest_topology(file: UploadFile = File(None)):
    """
    Upload a CSV topology dataset for ingestion and parsing.
    Phase 7B will implement full CSV parsing, validation, and domain object construction.
    """
    if file is not None:
        logger.info("File received: %s (%s)", file.filename, file.content_type)

    result = ingest_service.ingest_csv(
        file_path=file.filename if file else "none",
        dataset_name=file.filename if file else None,
    )
    return IngestResponse(**result)
