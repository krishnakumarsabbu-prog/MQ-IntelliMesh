import uuid
from datetime import datetime, timezone
from typing import Any

import pandas as pd

from app.core.logging import get_logger
from app.utils.naming_utils import classify_dataset, normalize_dataframe_columns, is_dlq_name
from app.utils.validation_utils import (
    check_required_fields,
    collect_blank_warnings,
    collect_duplicate_warnings,
    collect_cross_reference_warnings,
    clean_str,
    safe_int,
    safe_float,
)
from app.utils.graph_utils import build_topology_graph, summarize_graph
from app.utils.hackathon_normalizer import normalize_hackathon_csv

logger = get_logger(__name__)

_TOPOLOGY_REGISTRY: dict[str, dict[str, Any]] = {}

_PREVIEW_LIMIT = 5


def ingest_files(file_paths: list[tuple[str, str]]) -> dict[str, Any]:
    """
    Core ingestion entry point.

    Supports both:
    - Normalized multi-file topology CSVs (queue_managers, queues, applications, channels, relationships)
    - Denormalized hackathon-format single-CSV inventory files

    Args:
        file_paths: list of (original_filename, saved_path) tuples

    Returns:
        Structured IngestResponse-compatible dict
    """
    dataset_id = str(uuid.uuid4())[:8].upper()
    all_warnings: list[str] = []
    all_errors: list[str] = []
    files_processed = []
    datasets_detected: list[str] = []
    normalization_notes: list[str] = []

    raw_topology: dict[str, list[dict[str, Any]]] = {
        "queue_managers": [],
        "queues": [],
        "applications": [],
        "channels": [],
        "relationships": [],
        "metadata": [],
    }

    for original_filename, saved_path in file_paths:
        result = _parse_single_file(original_filename, saved_path, raw_topology, normalization_notes)
        files_processed.append(result)
        all_warnings.extend(result["warnings"])
        all_errors.extend(result["errors"])
        if result["dataset_type"] not in ("unknown", "error") and result["dataset_type"] not in datasets_detected:
            datasets_detected.append(result["dataset_type"])

    cross_warnings = collect_cross_reference_warnings(raw_topology)
    all_warnings.extend(cross_warnings)

    _enrich_queue_managers(raw_topology)

    try:
        graph = build_topology_graph(raw_topology)
        graph_summary = summarize_graph(graph)
    except Exception as e:
        logger.warning("Graph build failed: %s", e)
        graph_summary = {"nodes": 0, "edges": 0, "node_types": {}, "edge_types": {}}

    inventory = {
        "queue_managers": len(raw_topology["queue_managers"]),
        "queues": len(raw_topology["queues"]),
        "applications": len(raw_topology["applications"]),
        "channels": len(raw_topology["channels"]),
        "relationships": len(raw_topology["relationships"]),
        "metadata": len(raw_topology["metadata"]),
    }

    preview = {
        "queue_managers": [_strip_raw(r) for r in raw_topology["queue_managers"][:_PREVIEW_LIMIT]],
        "queues": [_strip_raw(r) for r in raw_topology["queues"][:_PREVIEW_LIMIT]],
        "applications": [_strip_raw(r) for r in raw_topology["applications"][:_PREVIEW_LIMIT]],
        "channels": [_strip_raw(r) for r in raw_topology["channels"][:_PREVIEW_LIMIT]],
        "relationships": [_strip_raw(r) for r in raw_topology["relationships"][:_PREVIEW_LIMIT]],
    }

    _TOPOLOGY_REGISTRY[dataset_id] = {
        "topology": raw_topology,
        "graph_summary": graph_summary,
        "ingested_at": datetime.now(timezone.utc).isoformat(),
        "source_files": [f for f, _ in file_paths],
        "normalization_notes": normalization_notes,
    }

    has_errors = len(all_errors) > 0
    is_hackathon = "hackathon" in datasets_detected
    status = "partial" if has_errors else "success"
    if is_hackathon:
        message = (
            "Hackathon MQ inventory ingested and normalized — topology model built from denormalized CSV"
        )
    else:
        message = (
            "Topology datasets ingested with errors — review error list"
            if has_errors
            else "Topology datasets ingested successfully"
        )

    logger.info(
        "Ingestion complete [%s]: %d QMs, %d queues, %d apps, %d channels, %d relations",
        dataset_id,
        inventory["queue_managers"],
        inventory["queues"],
        inventory["applications"],
        inventory["channels"],
        inventory["relationships"],
    )

    return {
        "status": status,
        "message": message,
        "dataset_id": dataset_id,
        "datasets_detected": datasets_detected,
        "files_processed": files_processed,
        "inventory": inventory,
        "graph": graph_summary,
        "warnings": all_warnings,
        "errors": all_errors,
        "preview": preview,
        "normalization_notes": normalization_notes,
        "source_format": "hackathon_denormalized" if is_hackathon else "normalized_multi_file",
    }


def _parse_single_file(
    filename: str,
    path: str,
    raw_topology: dict[str, list[dict[str, Any]]],
    normalization_notes: list[str],
) -> dict[str, Any]:
    file_errors: list[str] = []
    file_warnings: list[str] = []

    try:
        df = pd.read_csv(path, dtype=str)
    except Exception as e:
        msg = f"Failed to read '{filename}': {e}"
        logger.error(msg)
        return {
            "filename": filename,
            "dataset_type": "error",
            "row_count": 0,
            "columns_detected": [],
            "columns_normalized": [],
            "errors": [msg],
            "warnings": [],
        }

    df.columns = [c.strip() for c in df.columns]
    df = df.where(pd.notna(df), None)

    original_columns = list(df.columns)
    dataset_type = classify_dataset(filename, original_columns)
    logger.info("Classified '%s' as '%s' (%d rows)", filename, dataset_type, len(df))

    if dataset_type == "hackathon":
        return _parse_hackathon_file(filename, df, original_columns, raw_topology, normalization_notes)

    if dataset_type == "unknown":
        file_warnings.append(f"Could not classify '{filename}' — treating as unknown and skipping")
        return {
            "filename": filename,
            "dataset_type": "unknown",
            "row_count": len(df),
            "columns_detected": original_columns,
            "columns_normalized": original_columns,
            "errors": [],
            "warnings": file_warnings,
        }

    df = normalize_dataframe_columns(df, dataset_type)
    normalized_columns = list(df.columns)

    missing = check_required_fields(df, dataset_type)
    if missing:
        msg = f"'{filename}' missing required column(s): {missing}"
        file_errors.append(msg)
        logger.warning(msg)

    file_warnings.extend(collect_blank_warnings(df, dataset_type))
    file_warnings.extend(collect_duplicate_warnings(df, dataset_type))

    if not missing:
        records = _parse_records(df, dataset_type)
        raw_topology[dataset_type].extend(records)

    return {
        "filename": filename,
        "dataset_type": dataset_type,
        "row_count": len(df),
        "columns_detected": original_columns,
        "columns_normalized": normalized_columns,
        "errors": file_errors,
        "warnings": file_warnings,
    }


def _parse_hackathon_file(
    filename: str,
    df: pd.DataFrame,
    original_columns: list[str],
    raw_topology: dict[str, list[dict[str, Any]]],
    normalization_notes: list[str],
) -> dict[str, Any]:
    file_warnings: list[str] = []

    try:
        result = normalize_hackathon_csv(df)

        raw_topology["queue_managers"].extend(result["queue_managers"])
        raw_topology["queues"].extend(result["queues"])
        raw_topology["applications"].extend(result["applications"])
        raw_topology["channels"].extend(result["channels"])
        raw_topology["relationships"].extend(result["relationships"])
        raw_topology["metadata"].extend(result["metadata"])

        normalization_notes.extend(result.get("normalization_notes", []))
        file_warnings.extend(result.get("warnings", []))

        logger.info(
            "Hackathon CSV '%s' normalized: %d QMs, %d queues, %d apps, %d relationships",
            filename,
            len(result["queue_managers"]),
            len(result["queues"]),
            len(result["applications"]),
            len(result["relationships"]),
        )

        return {
            "filename": filename,
            "dataset_type": "hackathon",
            "row_count": len(df),
            "columns_detected": original_columns,
            "columns_normalized": [
                "discrete_queue_name", "q_manager_name", "q_type",
                "producername", "consumername", "app_id",
                "remote_q_mgr_name", "remote_q_name", "xmit_q_name",
                "primaryapprole", "line_of_business", "neighborhood",
            ],
            "errors": [],
            "warnings": file_warnings,
            "normalization_summary": {
                "source_format": "hackathon_denormalized",
                "queue_managers_inferred": len(result["queue_managers"]),
                "queues_extracted": len(result["queues"]),
                "applications_inferred": len(result["applications"]),
                "relationships_reconstructed": len(result["relationships"]),
            },
        }

    except Exception as e:
        msg = f"Hackathon normalization failed for '{filename}': {e}"
        logger.error(msg)
        return {
            "filename": filename,
            "dataset_type": "hackathon",
            "row_count": len(df),
            "columns_detected": original_columns,
            "columns_normalized": original_columns,
            "errors": [msg],
            "warnings": [],
        }


def _parse_records(df: pd.DataFrame, dataset_type: str) -> list[dict[str, Any]]:
    records = []
    for _, row in df.iterrows():
        raw = {k: clean_str(v) for k, v in row.to_dict().items()}

        if dataset_type == "queue_managers":
            record = {
                "qm_name": raw.get("qm_name"),
                "qm_type": raw.get("qm_type") or "UNKNOWN",
                "region": raw.get("region"),
                "neighborhood": raw.get("neighborhood"),
                "environment": raw.get("environment"),
                "host": raw.get("host"),
                "port": safe_int(raw.get("port")),
                "platform": raw.get("platform"),
                "version": raw.get("version"),
                "has_dlq": False,
                "dlq_name": None,
                "raw": raw,
            }
            if record["qm_name"]:
                records.append(record)

        elif dataset_type == "queues":
            qname = raw.get("queue_name")
            record = {
                "queue_name": qname,
                "queue_type": (raw.get("queue_type") or "UNKNOWN").upper(),
                "owning_qm": raw.get("owning_qm"),
                "depth": safe_int(raw.get("depth")),
                "max_depth": safe_int(raw.get("max_depth")),
                "persistence": raw.get("persistence"),
                "get_enabled": raw.get("get_enabled"),
                "put_enabled": raw.get("put_enabled"),
                "description": raw.get("description"),
                "is_dlq": is_dlq_name(qname) if qname else False,
                "remote_qm": raw.get("remote_qm"),
                "raw": raw,
            }
            if record["queue_name"] and record["owning_qm"]:
                records.append(record)

        elif dataset_type == "applications":
            record = {
                "app_id": raw.get("app_id"),
                "connected_qm": raw.get("connected_qm"),
                "role": raw.get("role"),
                "description": raw.get("description"),
                "owning_team": raw.get("owning_team"),
                "compliance_tags": [],
                "message_volume_daily": safe_int(raw.get("message_volume_daily")),
                "raw": raw,
            }
            if record["app_id"]:
                records.append(record)

        elif dataset_type == "channels":
            record = {
                "channel_name": raw.get("channel_name"),
                "channel_type": (raw.get("channel_type") or "UNKNOWN").upper(),
                "from_qm": raw.get("from_qm"),
                "to_qm": raw.get("to_qm"),
                "connection_name": raw.get("connection_name"),
                "transmission_queue": raw.get("transmission_queue"),
                "status": (raw.get("status") or "UNKNOWN").upper(),
                "ssl_cipher": raw.get("ssl_cipher"),
                "description": raw.get("description"),
                "raw": raw,
            }
            if record["channel_name"] and record["from_qm"]:
                records.append(record)

        elif dataset_type == "relationships":
            record = {
                "producer_app": raw.get("producer_app"),
                "consumer_app": raw.get("consumer_app"),
                "queue_name": raw.get("queue_name"),
                "queue_manager": raw.get("queue_manager"),
                "message_type": raw.get("message_type"),
                "avg_msg_size_kb": safe_float(raw.get("avg_msg_size_kb")),
                "daily_volume": safe_int(raw.get("daily_volume")),
                "raw": raw,
            }
            if record["producer_app"] and record["consumer_app"]:
                records.append(record)

        elif dataset_type == "metadata":
            record = {
                "region": raw.get("region"),
                "neighborhood": raw.get("neighborhood"),
                "environment": raw.get("environment"),
                "raw": raw,
            }
            records.append(record)

    return records


def _enrich_queue_managers(raw_topology: dict[str, list[dict[str, Any]]]) -> None:
    qm_index = {qm["qm_name"]: qm for qm in raw_topology["queue_managers"] if qm.get("qm_name")}
    for q in raw_topology["queues"]:
        if q.get("is_dlq") and q.get("owning_qm"):
            owning = q["owning_qm"]
            if owning in qm_index:
                qm_index[owning]["has_dlq"] = True
                qm_index[owning]["dlq_name"] = q["queue_name"]


def _strip_raw(record: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in record.items() if k != "raw" and v is not None}


def get_dataset_summary(dataset_id: str) -> dict[str, Any]:
    entry = _TOPOLOGY_REGISTRY.get(dataset_id)
    if not entry:
        return {}
    topology = entry["topology"]
    return {
        "dataset_id": dataset_id,
        "ingested_at": entry.get("ingested_at"),
        "source_files": entry.get("source_files", []),
        "total_queue_managers": len(topology.get("queue_managers", [])),
        "total_queues": len(topology.get("queues", [])),
        "total_applications": len(topology.get("applications", [])),
        "total_channels": len(topology.get("channels", [])),
        "total_relations": len(topology.get("relationships", [])),
        "graph_summary": entry.get("graph_summary", {}),
        "status": "ready",
    }


def get_topology(dataset_id: str) -> dict[str, Any] | None:
    entry = _TOPOLOGY_REGISTRY.get(dataset_id)
    return entry["topology"] if entry else None


def list_datasets() -> list[str]:
    return list(_TOPOLOGY_REGISTRY.keys())
