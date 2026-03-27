import os
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
    """Strip path components and replace unsafe characters."""
    basename = os.path.basename(filename)
    safe = "".join(c if c.isalnum() or c in (".", "-", "_") else "_" for c in basename)
    return safe


def get_upload_path(filename: str) -> str:
    from app.core.constants import UPLOADS_DIR
    return os.path.join(UPLOADS_DIR, sanitize_filename(filename))


def get_output_path(filename: str) -> str:
    from app.core.constants import OUTPUTS_DIR
    return os.path.join(OUTPUTS_DIR, sanitize_filename(filename))


def file_size_mb(path: str) -> float:
    """Return file size in megabytes."""
    return os.path.getsize(path) / (1024 * 1024) if os.path.exists(path) else 0.0
