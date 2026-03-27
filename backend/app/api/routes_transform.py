from fastapi import APIRouter
from app.schemas.transform import TransformRequest, TransformResponse
from app.services import transform_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post("/transform", response_model=TransformResponse, tags=["Transformation"])
def transform(request: TransformRequest):
    """
    Generate the target-state topology from as-is findings.
    Phase 7D will implement the full transformation rule engine and decision log.
    """
    result = transform_service.generate_target_state(
        dataset_id=request.dataset_id,
        options=request.model_dump(),
    )
    return TransformResponse(**result)
