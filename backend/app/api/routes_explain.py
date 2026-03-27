from fastapi import APIRouter
from app.schemas.explain import ExplainRequest, ExplainResponse
from app.services import explain_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/explain", response_model=ExplainResponse, tags=["Explainability"])
def explain(decision_id: str | None = None, question: str | None = None):
    """
    Return a human-readable explanation for a transformation decision.
    Phase 7E will implement decision trace lookup and copilot reasoning.
    """
    result = explain_service.explain_decision(decision_id=decision_id, question=question)
    return ExplainResponse(**result)
