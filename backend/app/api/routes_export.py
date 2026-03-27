from fastapi import APIRouter
from app.schemas.export import ExportRequest, ExportResponse
from app.services import export_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/export", response_model=ExportResponse, tags=["Export"])
def export(transformation_id: str | None = None):
    """
    Generate delivery artifacts from the validated target-state model.
    Phase 7F will implement full artifact generation and provisioning pack export.
    """
    result = export_service.generate_exports(transformation_id=transformation_id)
    return ExportResponse(**result)


@router.post("/export", response_model=ExportResponse, tags=["Export"])
def export_with_options(request: ExportRequest):
    """
    Generate delivery artifacts with format and content options.
    """
    result = export_service.generate_exports(
        transformation_id=request.transformation_id,
        formats=request.formats,
    )
    return ExportResponse(**result)
