from app.core.logging import get_logger

logger = get_logger(__name__)


def explain_decision(decision_id: str | None = None, question: str | None = None) -> dict:
    """
    Phase 7E: Return a human-readable explanation for a transformation decision.
    - Look up decision by ID from transformation log
    - Build a structured DecisionTrace with:
        * Subject and change description
        * Rationale string
        * Supporting evidence (findings, traffic data, compliance refs)
        * Alternatives considered
        * Confidence score
    - Optionally answer a free-text copilot question about the topology
    TODO: implement decision trace lookup from transform_service output
    TODO: implement natural-language rationale builder
    TODO: implement copilot Q&A against topology context
    """
    logger.info("explain_decision called — placeholder, decision_id=%s", decision_id)
    return {
        "message": "Explainability endpoint ready",
        "status": "placeholder",
        "next_phase": "Decision trace and copilot reasoning",
    }
