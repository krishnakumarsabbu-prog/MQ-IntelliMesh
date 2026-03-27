from pydantic import BaseModel
from typing import Optional


class TransformRequest(BaseModel):
    dataset_id: Optional[str] = None
    apply_compliance_rules: bool = True
    remove_orphan_objects: bool = True
    consolidate_shared_qms: bool = True


class TransformDecision(BaseModel):
    decision_id: str
    category: str
    subject: str
    change: str
    rationale: str
    confidence: float
    complexity_delta: int
    risk_delta: int


class TransformResponse(BaseModel):
    message: str
    status: str
    transformation_id: Optional[str] = None
    total_decisions: int = 0
    added: int = 0
    removed: int = 0
    modified: int = 0
    decisions: list[TransformDecision] = []
    next_phase: Optional[str] = None
