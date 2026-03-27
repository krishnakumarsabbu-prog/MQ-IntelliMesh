from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.schemas.analysis import AnalyzeResponse
from app.services import analysis_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/analyze", response_model=AnalyzeResponse, tags=["Analysis"])
def analyze(dataset_id: Optional[str] = Query(None, description="Dataset ID from /api/ingest. Uses latest if omitted.")):
    """
    Run the Phase 7C as-is topology findings engine.

    Analyzes the ingested canonical topology model and returns:
    - Structured findings across 10 check categories
    - Severity-graded issues (critical / high / medium / low)
    - Topology health score (0–100)
    - Hotspot identification
    - Policy violation count
    - Category breakdown for dashboard consumption

    Must call POST /api/ingest first to load a topology dataset.
    """
    result = analysis_service.analyze_topology(dataset_id=dataset_id)

    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result["message"])

    return AnalyzeResponse(**result)
