import os
import shutil
from app.core.logging import get_logger

logger = get_logger(__name__)


def ensure_directory(path: str) -> None:
    os.makedirs(path, exist_ok=True)
    logger.debug("Directory ensured: %s", path)


def ensure_data_directories() -> None:
    from app.core.constants import UPLOADS_DIR, OUTPUTS_DIR
    ensure_directory(UPLOADS_DIR)
    ensure_directory(OUTPUTS_DIR)


def sanitize_filename(filename: str) -> str:
    basename = os.path.basename(filename)
    safe = "".join(c if c.isalnum() or c in (".", "-", "_") else "_" for c in basename)
    return safe


def get_upload_path(filename: str) -> str:
    from app.core.constants import UPLOADS_DIR
    return os.path.join(UPLOADS_DIR, sanitize_filename(filename))


def get_output_path(filename: str) -> str:
    from app.core.constants import OUTPUTS_DIR
    return os.path.join(OUTPUTS_DIR, sanitize_filename(filename))


async def save_upload_file(upload_file, destination: str) -> int:
    from app.core.constants import MAX_UPLOAD_SIZE_BYTES
    content = await upload_file.read()
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=413,
            detail=f"File '{upload_file.filename}' exceeds maximum upload size of 50 MB.",
        )
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    with open(destination, "wb") as f:
        f.write(content)
    logger.info("Saved upload: %s (%d bytes)", destination, len(content))
    return len(content)


def file_size_mb(path: str) -> float:
    return os.path.getsize(path) / (1024 * 1024) if os.path.exists(path) else 0.0


def list_uploads() -> list[str]:
    from app.core.constants import UPLOADS_DIR
    if not os.path.exists(UPLOADS_DIR):
        return []
    return [f for f in os.listdir(UPLOADS_DIR) if f.endswith(".csv")]


def delete_upload(filename: str) -> bool:
    path = get_upload_path(filename)
    if os.path.exists(path):
        os.remove(path)
        logger.info("Deleted upload: %s", path)
        return True
    return False
