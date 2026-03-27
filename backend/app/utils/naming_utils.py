import re

CANONICAL_PATTERN = re.compile(r"^[A-Z][A-Z0-9]{0,3}\.[A-Z][A-Z0-9]{0,7}\.[A-Z]{2,4}$")
DLQ_PREFIXES = ("DLQ.", "DEAD.", "DEADLETTER.")
XMIT_PREFIXES = ("XMIT.", "XMT.", "TX.")

_QM_COLUMN_HINTS = {"qm", "qm_name", "queue_manager", "queue_manager_name", "qmgr", "manager_name"}
_QUEUE_COLUMN_HINTS = {"queue_name", "queue", "owning_qm", "queue_type", "maxdepth", "defpsist"}
_APP_COLUMN_HINTS = {"app_id", "app", "application", "application_id", "app_name", "connected_qm"}
_CHANNEL_COLUMN_HINTS = {"channel_name", "channel", "from_qm", "to_qm", "channel_type", "source_qm", "target_qm"}
_RELATIONSHIP_COLUMN_HINTS = {"producer_app", "consumer_app", "producer", "consumer", "source_app", "target_app"}
_METADATA_COLUMN_HINTS = {"region", "neighborhood", "environment"}

_FILENAME_HINTS: dict[str, list[str]] = {
    "queue_managers": ["queue_manager", "queuemanager", "qm", "qmgr", "managers"],
    "queues": ["queue", "queues"],
    "applications": ["application", "applications", "app", "apps"],
    "channels": ["channel", "channels"],
    "relationships": ["relationship", "relationships", "relation", "producer", "consumer", "flow"],
    "metadata": ["metadata", "meta", "environment", "region", "neighborhood"],
}

_CANONICAL_COLUMN_MAP: dict[str, dict[str, str]] = {
    "queue_managers": {
        "qm": "qm_name",
        "qm_name": "qm_name",
        "queue_manager": "qm_name",
        "queue_manager_name": "qm_name",
        "qmgr": "qm_name",
        "manager_name": "qm_name",
        "type": "qm_type",
        "qm_type": "qm_type",
        "manager_type": "qm_type",
        "region": "region",
        "neighborhood": "neighborhood",
        "environment": "environment",
        "env": "environment",
        "host": "host",
        "hostname": "host",
        "port": "port",
        "platform": "platform",
        "version": "version",
    },
    "queues": {
        "queue": "queue_name",
        "queue_name": "queue_name",
        "name": "queue_name",
        "owning_qm": "owning_qm",
        "owner_qm": "owning_qm",
        "queue_manager": "owning_qm",
        "qm_name": "owning_qm",
        "qm": "owning_qm",
        "type": "queue_type",
        "queue_type": "queue_type",
        "depth": "depth",
        "current_depth": "depth",
        "curdepth": "depth",
        "maxdepth": "max_depth",
        "max_depth": "max_depth",
        "defpsist": "persistence",
        "persistence": "persistence",
        "get": "get_enabled",
        "get_enabled": "get_enabled",
        "put": "put_enabled",
        "put_enabled": "put_enabled",
        "description": "description",
        "descr": "description",
        "remote_qm": "remote_qm",
        "xmitq": "remote_qm",
    },
    "applications": {
        "app": "app_id",
        "app_id": "app_id",
        "application": "app_id",
        "application_id": "app_id",
        "app_name": "app_id",
        "name": "app_id",
        "qm": "connected_qm",
        "connected_qm": "connected_qm",
        "queue_manager": "connected_qm",
        "primary_qm": "connected_qm",
        "role": "role",
        "app_role": "role",
        "description": "description",
        "descr": "description",
        "team": "owning_team",
        "owning_team": "owning_team",
    },
    "channels": {
        "channel": "channel_name",
        "channel_name": "channel_name",
        "name": "channel_name",
        "type": "channel_type",
        "channel_type": "channel_type",
        "from_qm": "from_qm",
        "source_qm": "from_qm",
        "local_qm": "from_qm",
        "qm_name": "from_qm",
        "qm": "from_qm",
        "to_qm": "to_qm",
        "target_qm": "to_qm",
        "remote_qm": "to_qm",
        "connection_name": "connection_name",
        "conname": "connection_name",
        "xmitq": "transmission_queue",
        "transmission_queue": "transmission_queue",
        "status": "status",
        "ssl_cipher": "ssl_cipher",
        "sslciph": "ssl_cipher",
        "description": "description",
        "descr": "description",
    },
    "relationships": {
        "producer": "producer_app",
        "producer_app": "producer_app",
        "source_app": "producer_app",
        "consumer": "consumer_app",
        "consumer_app": "consumer_app",
        "target_app": "consumer_app",
        "queue": "queue_name",
        "queue_name": "queue_name",
        "queue_manager": "queue_manager",
        "qm_name": "queue_manager",
        "message_type": "message_type",
        "msg_type": "message_type",
        "avg_msg_size_kb": "avg_msg_size_kb",
        "msg_size": "avg_msg_size_kb",
        "daily_volume": "daily_volume",
        "volume": "daily_volume",
    },
    "metadata": {
        "region": "region",
        "neighborhood": "neighborhood",
        "environment": "environment",
        "env": "environment",
    },
}


def normalize_header(col: str) -> str:
    return col.strip().lower().replace(" ", "_").replace("-", "_")


def normalize_dataframe_columns(df, dataset_type: str):
    normalized = {normalize_header(c): c for c in df.columns}
    mapping = _CANONICAL_COLUMN_MAP.get(dataset_type, {})
    rename_map = {}
    for norm_col, orig_col in normalized.items():
        if norm_col in mapping:
            canonical = mapping[norm_col]
            if orig_col != canonical:
                rename_map[orig_col] = canonical
    return df.rename(columns=rename_map)


def classify_dataset(filename: str, columns: list[str]) -> str:
    fname = filename.lower().replace("-", "_").replace(" ", "_")
    fname_stem = fname.rsplit(".", 1)[0] if "." in fname else fname

    for dataset_type, hints in _FILENAME_HINTS.items():
        for hint in hints:
            if hint in fname_stem:
                return dataset_type

    norm_cols = {normalize_header(c) for c in columns}

    scores: dict[str, int] = {}
    for dtype, hint_set in [
        ("queue_managers", _QM_COLUMN_HINTS),
        ("queues", _QUEUE_COLUMN_HINTS),
        ("applications", _APP_COLUMN_HINTS),
        ("channels", _CHANNEL_COLUMN_HINTS),
        ("relationships", _RELATIONSHIP_COLUMN_HINTS),
        ("metadata", _METADATA_COLUMN_HINTS),
    ]:
        scores[dtype] = len(norm_cols & hint_set)

    best = max(scores, key=lambda k: scores[k])
    if scores[best] == 0:
        return "unknown"
    return best


def is_canonical_name(name: str) -> bool:
    return bool(CANONICAL_PATTERN.match(name.upper()))


def is_dlq_name(name: str) -> bool:
    upper = name.upper()
    return any(upper.startswith(p) for p in DLQ_PREFIXES)


def is_transmission_channel(name: str) -> bool:
    upper = name.upper()
    return any(upper.startswith(p) for p in XMIT_PREFIXES)


def suggest_canonical_name(raw_name: str, object_type: str = "QUEUE") -> str:
    return raw_name.upper().replace(" ", "_").replace("-", ".")


def count_naming_violations(names: list[str]) -> int:
    return sum(1 for n in names if not is_canonical_name(n))


def _sanitize(name: str) -> str:
    return name.upper().replace(" ", "_").replace("-", "_").replace(".", "_")


def local_queue_name(consumer_app: str, base_queue: str) -> str:
    app = _sanitize(consumer_app)[:20]
    q = _sanitize(base_queue)[:20]
    return f"LQ.{app}.{q}"


def remote_queue_name(consumer_app: str, base_queue: str) -> str:
    app = _sanitize(consumer_app)[:20]
    q = _sanitize(base_queue)[:20]
    return f"RQ.{app}.{q}"


def xmit_queue_name(source_qm: str, target_qm: str) -> str:
    src = _sanitize(source_qm)[:20]
    tgt = _sanitize(target_qm)[:20]
    return f"XMIT.{src}.{tgt}"


def sender_channel_name(from_qm: str, to_qm: str) -> str:
    src = _sanitize(from_qm)[:15]
    tgt = _sanitize(to_qm)[:15]
    return f"{src}.{tgt}.SDR"


def receiver_channel_name(to_qm: str, from_qm: str) -> str:
    tgt = _sanitize(to_qm)[:15]
    src = _sanitize(from_qm)[:15]
    return f"{tgt}.{src}.RCVR"
