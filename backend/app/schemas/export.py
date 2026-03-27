from pydantic import BaseModel
from typing import Optional


class ExportRequest(BaseModel):
    transformation_id: Optional[str] = None
    formats: list[str] = ["csv", "yaml", "json"]
    include_evidence: bool = True


class ExportArtifact(BaseModel):
    artifact_id: str
    name: str
    format: str
    size_bytes: Optional[int] = None
    path: Optional[str] = None
    status: str


class ExportResponse(BaseModel):
    message: str
    status: str
    transformation_id: Optional[str] = None
    artifacts: list[ExportArtifact] = []
    total_artifacts: int = 0
    next_phase: Optional[str] = None
