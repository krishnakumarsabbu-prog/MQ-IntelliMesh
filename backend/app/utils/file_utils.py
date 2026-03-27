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


def get_exports_base_dir() -> str:
    from app.core.constants import DATA_DIR
    return os.path.join(DATA_DIR, "exports")


def create_export_directory(export_id: str) -> str:
    base = get_exports_base_dir()
    export_dir = os.path.join(base, export_id)
    os.makedirs(export_dir, exist_ok=True)
    logger.debug("Export directory created: %s", export_dir)
    return export_dir


def write_csv(df, path: str) -> int:
    df.to_csv(path, index=False)
    size = os.path.getsize(path)
    logger.debug("Wrote CSV: %s (%d bytes)", path, size)
    return size


def write_json(data: dict, path: str) -> int:
    import json
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
    size = os.path.getsize(path)
    logger.debug("Wrote JSON: %s (%d bytes)", path, size)
    return size


def zip_directory(source_dir: str, zip_path: str) -> int:
    zip_base = zip_path.removesuffix(".zip")
    shutil.make_archive(zip_base, "zip", source_dir)
    size = os.path.getsize(zip_path) if os.path.exists(zip_path) else 0
    logger.info("Created ZIP: %s (%d bytes)", zip_path, size)
    return size


def list_export_directories() -> list[str]:
    base = get_exports_base_dir()
    if not os.path.exists(base):
        return []
    return sorted(
        [d for d in os.listdir(base) if os.path.isdir(os.path.join(base, d))],
        reverse=True,
    )


def get_file_size(path: str) -> int:
    return os.path.getsize(path) if os.path.exists(path) else 0


def read_json(path: str) -> dict:
    import json
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
