from pydantic import BaseModel
from typing import Optional


class IngestRequest(BaseModel):
    dataset_name: Optional[str] = None
    description: Optional[str] = None


class IngestResponse(BaseModel):
    message: str
    status: str
    dataset_id: Optional[str] = None
    filename: Optional[str] = None
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    next_phase: Optional[str] = None


class IngestValidationResult(BaseModel):
    valid: bool
    row_count: int
    column_count: int
    missing_required_columns: list[str] = []
    warnings: list[str] = []
