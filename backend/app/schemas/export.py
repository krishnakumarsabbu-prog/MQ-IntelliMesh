from pydantic import BaseModel
from typing import Optional, Any


class ExportRequest(BaseModel):
    dataset_id: Optional[str] = None
    transformation_id: Optional[str] = None


class ExportArtifact(BaseModel):
    name: str
    type: str
    records: int
    path: str
    size_bytes: int = 0


class ExportBundle(BaseModel):
    name: str
    path: str
    size_bytes: int


class ExportManifest(BaseModel):
    export_id: str
    generated_at: str
    dataset_id: str
    transformation_id: str
    artifacts: list[ExportArtifact] = []


class ExportResponse(BaseModel):
    status: str
    message: str
    export_id: str
    generated_at: str
    dataset_id: str
    transformation_id: str
    artifact_count: int = 0
    artifacts: list[ExportArtifact] = []
    bundle: Optional[ExportBundle] = None
    summary: dict[str, Any] = {}
