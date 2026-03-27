import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.schemas.export import ExportRequest, ExportResponse
from app.services import export_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post("/export", response_model=ExportResponse, tags=["Export"])
def run_export(request: ExportRequest):
    """
    Phase 7E: Generate all export artifacts and bundle them into a downloadable ZIP.

    Generates:
    - target_queue_managers.csv, target_applications.csv
    - target_local_queues.csv, target_remote_queues.csv
    - target_xmit_queues.csv, target_channels.csv, target_routes.csv
    - complexity_comparison.csv, analysis_findings.csv
    - transformation_decisions.csv, target_validation.csv
    - export_summary.json, transform_summary.json, manifest.json
    - mq_intellimesh_export_<export_id>.zip

    Requires: POST /api/ingest (and optionally /api/transform) to be called first.
    """
    result = export_service.generate_exports(
        dataset_id=request.dataset_id,
        transformation_id=request.transformation_id,
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    return ExportResponse(**result)


@router.get("/export/latest", response_model=ExportResponse, tags=["Export"])
def get_latest_export():
    """
    Retrieve the metadata and artifact list from the most recent export run.
    Useful for the frontend Exports page to display artifact state without re-running.
    """
    result = export_service.get_latest_export()
    if result is None:
        raise HTTPException(
            status_code=404,
            detail="No exports found. Run POST /api/export first.",
        )
    return ExportResponse(**result)


@router.get("/export/download/{export_id}", tags=["Export"])
def download_export(export_id: str):
    """
    Download the ZIP bundle for a specific export ID.
    Returns the ZIP file as a streaming download.
    """
    from app.utils.file_utils import get_exports_base_dir, get_file_size

    zip_name = f"mq_intellimesh_export_{export_id}.zip"
    zip_path = os.path.join(get_exports_base_dir(), zip_name)

    if not os.path.exists(zip_path):
        raise HTTPException(
            status_code=404,
            detail=f"Export bundle '{zip_name}' not found. Run POST /api/export first.",
        )

    return FileResponse(
        path=zip_path,
        media_type="application/zip",
        filename=zip_name,
    )
