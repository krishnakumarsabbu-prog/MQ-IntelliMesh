from fastapi import APIRouter
from app.schemas.analysis import AnalysisResponse
from app.services import analysis_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/analyze", response_model=AnalysisResponse, tags=["Analysis"])
def analyze(dataset_id: str | None = None):
    """
    Run the as-is topology findings engine against an ingested dataset.
    Phase 7C will implement compliance rule evaluation and graph-based findings detection.
    """
    result = analysis_service.analyze_topology(dataset_id=dataset_id)
    return AnalysisResponse(**result)
