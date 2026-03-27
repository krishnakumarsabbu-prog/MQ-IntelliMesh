from pydantic import BaseModel
from typing import Optional


class ExplainRequest(BaseModel):
    decision_id: Optional[str] = None
    question: Optional[str] = None


class DecisionTrace(BaseModel):
    decision_id: str
    subject: str
    rationale: str
    evidence: list[str] = []
    confidence: float
    alternatives_considered: list[str] = []


class ExplainResponse(BaseModel):
    message: str
    status: str
    decision_id: Optional[str] = None
    explanation: Optional[str] = None
    trace: Optional[DecisionTrace] = None
    next_phase: Optional[str] = None
