"""
Hackathon CSV Normalizer
========================

Converts the denormalized hackathon MQ inventory CSV format into the canonical
topology model used by MQ IntelliMesh.

The hackathon CSV is a "relationship-enriched MQ inventory" format where each
row represents a combination of:
  - A queue (with its type, owning QM, routing metadata)
  - The primary application that owns or interacts with that queue
  - Both the producer and consumer application names
  - Business / classification metadata

Key canonical field mappings from the hackathon CSV:
  - Discrete Queue Name  → queue entity (queue_name)
  - q_manager_name       → owning queue manager
  - q_type               → queue subtype (Local, Remote, Alias, XMITQ)
  - ProducerName         → producer application
  - ConsumerName         → consumer application
  - Primary App_Full_Name / PrimaryAppDisp / app_id → primary application identity
  - remote_q_mgr_name    → remote QM reference
  - remote_q_name        → remote queue reference
  - xmit_q_name          → transmission queue
  - usage                → queue usage hint
  - Neighborhood/Primary Neighborhood → context metadata
  - line_of_business     → LOB classification
"""

from __future__ import annotations

import re
import uuid
from typing import Any

import pandas as pd

from app.core.logging import get_logger

logger = get_logger(__name__)

_INVALID_VALUES = frozenset({
    "", "nan", "none", "null", "n/a", "na", "unknown", "7", "0",
    "-", "--", "n.a.", "not applicable", "not available",
})

_BOOLEAN_INHIBIT_ENABLED = frozenset({"enabled", "yes", "true", "1"})
_BOOLEAN_INHIBIT_DISABLED = frozenset({"disabled", "no", "false", "0", "not enabled"})

_HACKATHON_REQUIRED_COLS = {
    "discrete queue name",
    "q_manager_name",
    "q_type",
}

_HACKATHON_SIGNATURE_COLS = {
    "discrete queue name",
    "producername",
    "consumername",
    "q_manager_name",
    "primaryapprole",
    "app_id",
    "line_of_business",
    "xmit_q_name",
    "remote_q_mgr_name",
    "remote_q_name",
}


def is_hackathon_format(columns: list[str]) -> bool:
    normalized = {_norm(c) for c in columns}
    matched = len(normalized & _HACKATHON_SIGNATURE_COLS)
    return matched >= 5


def normalize_hackathon_csv(df: pd.DataFrame) -> dict[str, Any]:
    """
    Master entry point. Returns a canonical topology dict compatible with the
    internal raw_topology structure expected by ingest_service.

    Returns:
        {
            "queue_managers": [...],
            "queues": [...],
            "applications": [...],
            "channels": [],           # populated during transform stage
            "relationships": [...],
            "metadata": [...],
            "normalization_notes": [...],
            "warnings": [...],
        }
    """
    df = _standardize_columns(df)
    df = df.where(pd.notna(df), None)

    notes: list[str] = []
    warnings: list[str] = []

    queue_managers = _extract_queue_managers(df, notes, warnings)
    queues = _extract_queues(df, queue_managers, notes, warnings)
    applications = _extract_applications(df, queue_managers, notes, warnings)
    relationships = _extract_relationships(df, applications, notes, warnings)
    metadata = _extract_metadata(df)

    logger.info(
        "Hackathon normalizer complete: %d QMs, %d queues, %d apps, %d relationships",
        len(queue_managers), len(queues), len(applications), len(relationships),
    )

    return {
        "queue_managers": queue_managers,
        "queues": queues,
        "applications": applications,
        "channels": [],
        "relationships": relationships,
        "metadata": metadata,
        "normalization_notes": notes,
        "warnings": warnings,
    }


def _norm(s: str) -> str:
    return re.sub(r"[\s\-_]+", "", str(s).strip().lower())


def _standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    rename_map: dict[str, str] = {}
    for col in df.columns:
        n = _norm(col)
        canonical = _COLUMN_ALIAS_MAP.get(n)
        if canonical and col != canonical:
            rename_map[col] = canonical
    return df.rename(columns=rename_map)


def _clean(val: Any) -> str | None:
    if val is None:
        return None
    s = str(val).strip()
    if s.lower() in _INVALID_VALUES:
        return None
    return s if s else None


def _clean_qm_name(val: Any) -> str | None:
    cleaned = _clean(val)
    if not cleaned:
        return None
    if re.fullmatch(r"[0-9]+", cleaned):
        return None
    if len(cleaned) < 2:
        return None
    return cleaned.upper()


def _clean_queue_name(val: Any) -> str | None:
    cleaned = _clean(val)
    if not cleaned:
        return None
    if re.fullmatch(r"[0-9]+", cleaned):
        return None
    return cleaned


def _clean_app_name(val: Any) -> str | None:
    cleaned = _clean(val)
    if not cleaned:
        return None
    if re.fullmatch(r"[0-9]+", cleaned):
        return None
    if len(cleaned) <= 1:
        return None
    return cleaned


def _resolve_inhibit(val: Any) -> str:
    if val is None:
        return "1"
    s = str(val).strip().lower()
    if s in _INVALID_VALUES:
        return "1"
    if s in _BOOLEAN_INHIBIT_ENABLED:
        return "0"
    return "1"


def _safe_col(df: pd.DataFrame, col: str, row: pd.Series) -> str | None:
    if col in df.columns:
        return _clean(row.get(col))
    return None


def _extract_queue_managers(
    df: pd.DataFrame,
    notes: list[str],
    warnings: list[str],
) -> list[dict[str, Any]]:
    seen: dict[str, dict[str, Any]] = {}

    qm_col = "q_manager_name"
    remote_qm_col = "remote_q_mgr_name"

    for _, row in df.iterrows():
        for col in (qm_col, remote_qm_col):
            raw_qm = row.get(col)
            qm_name = _clean_qm_name(raw_qm)
            if qm_name and qm_name not in seen:
                neighborhood = _clean(row.get("neighborhood")) or _clean(row.get("primary_neighborhood"))
                lob = _clean(row.get("line_of_business"))
                hosting = _clean(row.get("primary_hosting_type"))

                seen[qm_name] = {
                    "qm_name": qm_name,
                    "qm_type": "DEDICATED",
                    "region": None,
                    "neighborhood": neighborhood,
                    "environment": lob,
                    "host": None,
                    "port": None,
                    "platform": hosting,
                    "version": None,
                    "has_dlq": False,
                    "dlq_name": None,
                    "is_remote_ref": col == remote_qm_col,
                    "raw": {},
                }

    notes.append(f"Extracted {len(seen)} unique queue managers from hackathon CSV")
    return list(seen.values())


def _infer_q_subtype(q_type_raw: str | None, queue_name: str | None) -> str:
    if not q_type_raw:
        return "LOCAL"
    parts = [p.strip().upper() for p in re.split(r"[;,]", q_type_raw)]
    if "ALIAS" in parts:
        return "ALIAS"
    if "REMOTE" in parts and "ALIAS" not in parts:
        return "REMOTE"
    if "LOCAL" in parts:
        return "LOCAL"
    if q_type_raw.upper() in ("XMITQ", "TRANSMISSION"):
        return "XMITQ"
    if queue_name:
        upper = queue_name.upper()
        if upper.startswith("XMIT.") or upper.endswith(".XMIT"):
            return "XMITQ"
    return "LOCAL"


def _extract_queues(
    df: pd.DataFrame,
    qm_list: list[dict[str, Any]],
    notes: list[str],
    warnings: list[str],
) -> list[dict[str, Any]]:
    seen: dict[tuple[str, str], dict[str, Any]] = {}
    qm_set = {qm["qm_name"] for qm in qm_list}
    invalid_qm_refs: set[str] = set()

    for _, row in df.iterrows():
        q_name = _clean_queue_name(row.get("discrete_queue_name"))
        if not q_name:
            continue

        owning_qm = _clean_qm_name(row.get("q_manager_name"))
        if not owning_qm:
            continue

        if owning_qm not in qm_set:
            invalid_qm_refs.add(owning_qm)
            continue

        key = (q_name, owning_qm)
        if key in seen:
            continue

        q_type_raw = _clean(row.get("q_type"))
        subtype = _infer_q_subtype(q_type_raw, q_name)

        remote_qm = _clean_qm_name(row.get("remote_q_mgr_name"))
        remote_q = _clean_queue_name(row.get("remote_q_name"))
        xmit_q = _clean_queue_name(row.get("xmit_q_name"))
        usage = _clean(row.get("usage"))
        if usage and usage.lower() in _INVALID_VALUES:
            usage = None
        persistence = _clean(row.get("def_persistence"))
        inhibit_get_raw = row.get("inhibit_get")
        inhibit_put_raw = row.get("inhibit_put")

        seen[key] = {
            "queue_name": q_name,
            "queue_type": subtype,
            "owning_qm": owning_qm,
            "depth": None,
            "max_depth": None,
            "persistence": persistence,
            "get_enabled": _resolve_inhibit(inhibit_get_raw),
            "put_enabled": _resolve_inhibit(inhibit_put_raw),
            "description": usage,
            "is_dlq": False,
            "remote_qm": remote_qm,
            "remote_q_name": remote_q,
            "xmit_q_name": xmit_q,
            "raw": {},
        }

    if invalid_qm_refs:
        warnings.append(
            f"Skipped {len(invalid_qm_refs)} queue rows — invalid QM references: "
            f"{', '.join(list(invalid_qm_refs)[:5])}"
        )

    notes.append(f"Extracted {len(seen)} unique queues from hackathon CSV")
    return list(seen.values())


def _infer_app_role(role_raw: str | None, producer: str | None, consumer: str | None, app_disp: str | None) -> str:
    if role_raw:
        role_upper = role_raw.upper()
        if "PRODUCER" in role_upper and "CONSUMER" in role_upper:
            return "Producer/Consumer"
        if "PRODUCER" in role_upper:
            return "Producer"
        if "CONSUMER" in role_upper:
            return "Consumer"
    if app_disp:
        disp_upper = app_disp.upper()
        if "PRODUCER" in disp_upper:
            return "Producer"
        if "CONSUMER" in disp_upper:
            return "Consumer"
        if "BOTH" in disp_upper or "MAINFRAME" in disp_upper:
            return "Producer/Consumer"
    if producer and consumer:
        return "Producer/Consumer"
    if producer:
        return "Producer"
    if consumer:
        return "Consumer"
    return "Unknown"


def _build_app_id(app_id_raw: str | None, app_full: str | None, app_disp: str | None) -> str | None:
    candidate = _clean_app_name(app_id_raw)
    if candidate and len(candidate) >= 2:
        return candidate
    candidate = _clean_app_name(app_full)
    if candidate:
        return candidate
    candidate = _clean_app_name(app_disp)
    if candidate:
        return candidate
    return None


def _extract_applications(
    df: pd.DataFrame,
    qm_list: list[dict[str, Any]],
    notes: list[str],
    warnings: list[str],
) -> list[dict[str, Any]]:
    qm_set = {qm["qm_name"] for qm in qm_list}
    seen: dict[str, dict[str, Any]] = {}

    for _, row in df.iterrows():
        app_id_raw = _clean(row.get("app_id"))
        merged_col = _clean(row.get("primary_app_id_qtype_merged"))
        if not app_id_raw and merged_col:
            parts = [p.strip() for p in merged_col.split() if p.strip()]
            if parts:
                candidate = parts[0]
                if len(candidate) >= 2 and not re.fullmatch(r"[0-9]+", candidate):
                    app_id_raw = candidate
        app_full = _clean(row.get("primary_app_full_name"))
        app_disp = _clean(row.get("primaryappdisp"))
        role_raw = _clean(row.get("primaryapprole"))
        producer_name = _clean_app_name(row.get("producername"))
        consumer_name = _clean_app_name(row.get("consumername"))

        connected_qm = _clean_qm_name(row.get("q_manager_name"))
        if connected_qm not in qm_set:
            connected_qm = None

        lob = _clean(row.get("line_of_business"))
        neighborhood = _clean(row.get("primary_neighborhood")) or _clean(row.get("neighborhood"))
        data_class = _clean(row.get("primary_data_classification"))
        pci = _clean(row.get("primary_pci"))
        hosting = _clean(row.get("primary_hosting_type"))

        app_id = _build_app_id(app_id_raw, app_full, app_disp)
        if not app_id:
            continue

        role = _infer_app_role(role_raw, producer_name, consumer_name, app_disp)

        if app_id not in seen:
            seen[app_id] = {
                "app_id": app_id,
                "connected_qm": connected_qm,
                "role": role,
                "description": app_full or app_disp,
                "owning_team": lob,
                "compliance_tags": _build_compliance_tags(pci, data_class, hosting),
                "message_volume_daily": None,
                "neighborhood": neighborhood,
                "line_of_business": lob,
                "data_classification": data_class,
                "hosting_type": hosting,
                "raw": {},
            }
        else:
            existing = seen[app_id]
            if not existing["connected_qm"] and connected_qm:
                existing["connected_qm"] = connected_qm
            if existing["role"] == "Unknown" and role != "Unknown":
                existing["role"] = role

    producer_names = set()
    consumer_names = set()
    for _, row in df.iterrows():
        p = _clean_app_name(row.get("producername"))
        c = _clean_app_name(row.get("consumername"))
        if p:
            producer_names.add(p)
        if c:
            consumer_names.add(c)

    for name in producer_names | consumer_names:
        if name not in seen:
            seen[name] = {
                "app_id": name,
                "connected_qm": None,
                "role": "Producer" if name in producer_names and name not in consumer_names else
                        "Consumer" if name in consumer_names and name not in producer_names else
                        "Producer/Consumer",
                "description": name,
                "owning_team": None,
                "compliance_tags": [],
                "message_volume_daily": None,
                "neighborhood": None,
                "line_of_business": None,
                "data_classification": None,
                "hosting_type": None,
                "raw": {},
            }

    notes.append(f"Extracted {len(seen)} unique applications from hackathon CSV")
    return list(seen.values())


def _build_compliance_tags(pci: str | None, data_class: str | None, hosting: str | None) -> list[str]:
    tags = []
    if pci and pci.upper() == "YES":
        tags.append("PCI")
    if data_class:
        tags.append(data_class.upper().replace(" ", "_"))
    if hosting:
        tags.append(hosting.upper().replace(" ", "_"))
    return tags


def _extract_relationships(
    df: pd.DataFrame,
    app_list: list[dict[str, Any]],
    notes: list[str],
    warnings: list[str],
) -> list[dict[str, Any]]:
    app_ids = {a["app_id"] for a in app_list}
    seen: set[tuple[str, str, str]] = set()
    relationships: list[dict[str, Any]] = []
    unresolved: int = 0

    for _, row in df.iterrows():
        producer_raw = _clean_app_name(row.get("producername"))
        consumer_raw = _clean_app_name(row.get("consumername"))
        queue_name = _clean_queue_name(row.get("discrete_queue_name"))
        qm_name = _clean_qm_name(row.get("q_manager_name"))

        if not producer_raw or not consumer_raw:
            continue

        if producer_raw == consumer_raw:
            continue

        producer = producer_raw if producer_raw in app_ids else None
        consumer = consumer_raw if consumer_raw in app_ids else None

        if not producer or not consumer:
            unresolved += 1
            continue

        key = (producer, consumer, queue_name or "")
        if key in seen:
            continue
        seen.add(key)

        relationships.append({
            "producer_app": producer,
            "consumer_app": consumer,
            "queue_name": queue_name,
            "queue_manager": qm_name,
            "message_type": None,
            "avg_msg_size_kb": None,
            "daily_volume": None,
            "raw": {},
        })

    if unresolved > 0:
        warnings.append(
            f"{unresolved} relationship rows could not be fully resolved "
            f"— producer/consumer app identity ambiguous"
        )

    notes.append(f"Reconstructed {len(relationships)} unique message flow relationships")
    return relationships


def _extract_metadata(df: pd.DataFrame) -> list[dict[str, Any]]:
    seen: set[str] = set()
    metadata: list[dict[str, Any]] = []
    for _, row in df.iterrows():
        neighborhood = _clean(row.get("neighborhood")) or _clean(row.get("primary_neighborhood"))
        lob = _clean(row.get("line_of_business"))
        key = f"{neighborhood}|{lob}"
        if key not in seen and (neighborhood or lob):
            seen.add(key)
            metadata.append({
                "region": None,
                "neighborhood": neighborhood,
                "environment": lob,
                "raw": {},
            })
    return metadata


_COLUMN_ALIAS_MAP: dict[str, str] = {
    "discretequeuename": "discrete_queue_name",
    "producername": "producername",
    "consumername": "consumername",
    "primaryappfullname": "primary_app_full_name",
    "primaryapp_fullname": "primary_app_full_name",
    "primaryappdisp": "primaryappdisp",
    "primaryapprole": "primaryapprole",
    "primaryapplicationidq_type": "primary_app_id_qtype_merged",
    "primaryapplicationid": "app_id",
    "primaryneighborhood": "primary_neighborhood",
    "primaryhostingtype": "primary_hosting_type",
    "primarydataclassification": "primary_data_classification",
    "primaryenterprisecriticalpaymentapplication": "primary_ecpa",
    "primarypci": "primary_pci",
    "primarypubliclyaccessible": "primary_publicly_accessible",
    "primarytrtc": "primary_trtc",
    "q_type": "q_type",
    "q_manager_name": "q_manager_name",
    "app_id": "app_id",
    "line_of_business": "line_of_business",
    "cluster_name": "cluster_name",
    "cluster_namelist": "cluster_namelist",
    "def_persistence": "def_persistence",
    "def_put_response": "def_put_response",
    "inhibit_get": "inhibit_get",
    "inhibit_put": "inhibit_put",
    "remote_q_mgr_name": "remote_q_mgr_name",
    "remote_q_name": "remote_q_name",
    "usage": "usage",
    "xmit_q_name": "xmit_q_name",
    "neighborhood": "neighborhood",
}
