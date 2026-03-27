from pydantic import BaseModel
from typing import Optional


class AnalysisRequest(BaseModel):
    dataset_id: Optional[str] = None


class FindingSummary(BaseModel):
    finding_id: str
    category: str
    severity: str
    title: str
    affected_objects: list[str] = []
    description: str


class AnalysisResponse(BaseModel):
    message: str
    status: str
    dataset_id: Optional[str] = None
    total_findings: int = 0
    critical: int = 0
    warnings: int = 0
    info: int = 0
    findings: list[FindingSummary] = []
    next_phase: Optional[str] = None
