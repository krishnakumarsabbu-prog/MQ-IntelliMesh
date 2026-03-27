from pydantic import BaseModel
from typing import Optional


class ComplexityRequest(BaseModel):
    dataset_id: Optional[str] = None


class ComplexityDimension(BaseModel):
    label: str
    score: float
    weight: float
    weighted_contribution: float
    note: str


class ComplexityHotspot(BaseModel):
    object_name: str
    object_type: str
    score: float
    reason: str


class ComplexityResponse(BaseModel):
    message: str
    status: str
    dataset_id: Optional[str] = None
    mtcs_score: Optional[float] = None
    dimensions: list[ComplexityDimension] = []
    hotspots: list[ComplexityHotspot] = []
    next_phase: Optional[str] = None
