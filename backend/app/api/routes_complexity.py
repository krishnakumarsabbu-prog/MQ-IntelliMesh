from fastapi import APIRouter
from app.schemas.complexity import ComplexityResponse
from app.services import complexity_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/complexity", response_model=ComplexityResponse, tags=["Complexity"])
def complexity(dataset_id: str | None = None):
    """
    Compute the MQ Topology Complexity Score (MTCS) for an ingested dataset.
    Phase 7D will implement the full weighted scoring formula and hotspot detection.
    """
    result = complexity_service.compute_complexity(dataset_id=dataset_id)
    return ComplexityResponse(**result)
