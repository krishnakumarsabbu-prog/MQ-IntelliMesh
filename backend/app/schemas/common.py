from pydantic import BaseModel
from typing import Any, Optional


class APIStatusResponse(BaseModel):
    message: str
    status: str
    next_phase: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    service: str


class VersionResponse(BaseModel):
    version: str
    environment: str


class RootResponse(BaseModel):
    name: str
    status: str
    version: str


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    status_code: int


class PlaceholderResponse(BaseModel):
    message: str
    status: str = "placeholder"
    next_phase: Optional[str] = None
    meta: Optional[dict[str, Any]] = None
