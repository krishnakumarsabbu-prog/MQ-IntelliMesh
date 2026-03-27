REQUIRED_INGEST_COLUMNS = {
    "QM_NAME",
    "OBJECT_TYPE",
    "OBJECT_NAME",
}

RECOMMENDED_INGEST_COLUMNS = {
    "QM_TYPE",
    "QUEUE_TYPE",
    "CHANNEL_TYPE",
    "MAXDEPTH",
    "DEFPSIST",
    "GET",
    "PUT",
    "STATUS",
    "APP_NAME",
}


def validate_csv_columns(columns: list[str]) -> dict:
    """
    Validate that an ingested CSV has the required and recommended columns.
    Returns a validation result dict with missing_required and missing_recommended lists.
    TODO: Phase 7B — integrate with ingest_service CSV validation step
    """
    upper_cols = {c.upper() for c in columns}
    missing_required = [c for c in REQUIRED_INGEST_COLUMNS if c not in upper_cols]
    missing_recommended = [c for c in RECOMMENDED_INGEST_COLUMNS if c not in upper_cols]
    return {
        "valid": len(missing_required) == 0,
        "missing_required": missing_required,
        "missing_recommended": missing_recommended,
    }


def validate_row_count(row_count: int, min_rows: int = 1) -> bool:
    return row_count >= min_rows


def validate_file_extension(filename: str, allowed: set[str] | None = None) -> bool:
    if allowed is None:
        allowed = {".csv"}
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in allowed
