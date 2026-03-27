from fastapi import APIRouter, HTTPException
from app.schemas.transform import TransformRequest, TransformResponse
from app.services import transform_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post("/transform", response_model=TransformResponse, tags=["Transformation"])
def transform(request: TransformRequest):
    """
    Phase 7D: Generate a policy-compliant, automation-ready MQ target-state architecture.

    Takes the ingested canonical topology and applies deterministic transformation rules:
    - Assigns every application exactly one owning Queue Manager
    - Generates local queues (consumer side), remote queues (producer side), XMIT queues
    - Creates one sender/receiver channel pair per required QM pair
    - Builds a complete route model: Producer → RemoteQ → XMIT → SDR → RCVR → LocalQ → Consumer
    - Validates all generated objects against hackathon compliance constraints
    - Computes before/after MTCS complexity scores with dimension-level breakdown

    Must call POST /api/ingest first to load a topology dataset.
    """
    result = transform_service.generate_target_state(dataset_id=request.dataset_id)

    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result["message"])

    return TransformResponse(**result)
