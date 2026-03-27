from typing import Any
import pandas as pd

_REQUIRED_FIELDS: dict[str, list[str]] = {
    "queue_managers": ["qm_name"],
    "queues": ["queue_name", "owning_qm"],
    "applications": ["app_id"],
    "channels": ["channel_name", "from_qm"],
    "relationships": ["producer_app", "consumer_app"],
    "metadata": [],
}


def check_required_fields(df: pd.DataFrame, dataset_type: str) -> list[str]:
    required = _REQUIRED_FIELDS.get(dataset_type, [])
    return [f for f in required if f not in df.columns]


def collect_blank_warnings(df: pd.DataFrame, dataset_type: str) -> list[str]:
    warnings = []
    required = _REQUIRED_FIELDS.get(dataset_type, [])
    for field in required:
        if field in df.columns:
            blank_count = df[field].isna().sum() + (df[field].astype(str).str.strip() == "").sum()
            if blank_count > 0:
                warnings.append(f"{blank_count} row(s) in '{dataset_type}' have blank required field '{field}'")
    return warnings


def collect_duplicate_warnings(df: pd.DataFrame, dataset_type: str) -> list[str]:
    key_map = {
        "queue_managers": "qm_name",
        "queues": "queue_name",
        "applications": "app_id",
        "channels": "channel_name",
        "relationships": None,
    }
    key = key_map.get(dataset_type)
    if key and key in df.columns:
        dups = df[key].dropna().duplicated().sum()
        if dups > 0:
            return [f"{dups} duplicate '{key}' value(s) found in '{dataset_type}'"]
    return []


def collect_cross_reference_warnings(
    topology: dict[str, list[dict[str, Any]]]
) -> list[str]:
    warnings = []
    known_qms = {r.get("qm_name") for r in topology.get("queue_managers", []) if r.get("qm_name")}
    known_apps = {r.get("app_id") for r in topology.get("applications", []) if r.get("app_id")}

    for q in topology.get("queues", []):
        owning = q.get("owning_qm")
        if owning and known_qms and owning not in known_qms:
            warnings.append(f"Queue '{q.get('queue_name')}' references unknown queue manager '{owning}'")

    for ch in topology.get("channels", []):
        from_qm = ch.get("from_qm")
        to_qm = ch.get("to_qm")
        if from_qm and known_qms and from_qm not in known_qms:
            warnings.append(f"Channel '{ch.get('channel_name')}' has unknown source QM '{from_qm}'")
        if to_qm and known_qms and to_qm not in known_qms:
            warnings.append(f"Channel '{ch.get('channel_name')}' has unknown target QM '{to_qm}'")

    for rel in topology.get("relationships", []):
        producer = rel.get("producer_app")
        consumer = rel.get("consumer_app")
        if producer and known_apps and producer not in known_apps:
            warnings.append(f"Relationship references unknown producer app '{producer}'")
        if consumer and known_apps and consumer not in known_apps:
            warnings.append(f"Relationship references unknown consumer app '{consumer}'")

    return warnings


def validate_file_extension(filename: str, allowed: set[str] | None = None) -> bool:
    if allowed is None:
        allowed = {".csv"}
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in allowed


def validate_row_count(row_count: int, min_rows: int = 1) -> bool:
    return row_count >= min_rows


def safe_int(value: Any) -> int | None:
    try:
        return int(float(str(value).strip()))
    except (ValueError, TypeError):
        return None


def safe_float(value: Any) -> float | None:
    try:
        return float(str(value).strip())
    except (ValueError, TypeError):
        return None


def clean_str(value: Any) -> str | None:
    if value is None:
        return None
    s = str(value).strip()
    return s if s and s.lower() not in ("nan", "none", "null", "") else None
