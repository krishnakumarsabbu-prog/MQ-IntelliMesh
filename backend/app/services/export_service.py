import os
import json
from datetime import datetime, timezone
from typing import Any

import pandas as pd

from app.core.logging import get_logger
from app.utils.file_utils import (
    create_export_directory,
    get_exports_base_dir,
    write_csv,
    write_json,
    zip_directory,
    list_export_directories,
    get_file_size,
    read_json,
)

logger = get_logger(__name__)

_LATEST_EXPORT: dict[str, Any] = {}


def generate_exports(
    dataset_id: str | None = None,
    transformation_id: str | None = None,
) -> dict[str, Any]:
    from app.services.ingest_service import get_topology, list_datasets
    from app.services.transform_service import generate_target_state
    from app.services.analysis_service import analyze_topology

    if dataset_id:
        topology = get_topology(dataset_id)
        if topology is None:
            return _error("No topology found for dataset_id. Please ingest MQ CSV files first.")
    else:
        all_ids = list_datasets()
        if not all_ids:
            return _error("No topology dataset available. Please ingest MQ CSV files first via POST /api/ingest.")
        dataset_id = all_ids[-1]
        topology = get_topology(dataset_id)
        if topology is None:
            return _error("Could not load topology from registry.")

    analysis_result = analyze_topology(dataset_id)
    transform_result = generate_target_state(dataset_id=dataset_id)

    if transform_result.get("status") == "error":
        return _error("Transformation failed — " + transform_result.get("message", "unknown error"))

    now = datetime.now(timezone.utc)
    export_id = "EXP-" + now.strftime("%Y%m%d-%H%M%S")
    generated_at = now.isoformat()

    tx_id = transform_result.get("transformation_id", "")
    export_dir = create_export_directory(export_id)

    artifacts: list[dict[str, Any]] = []

    target = transform_result.get("target_topology", {})
    decisions = transform_result.get("decisions", [])
    validation = transform_result.get("validation", {})
    complexity = transform_result.get("complexity", {})
    tx_summary = transform_result.get("summary", {})
    findings = analysis_result.get("findings", [])

    artifacts += _write_target_csvs(target, export_dir)
    artifacts += _write_analysis_csvs(findings, decisions, validation, complexity, export_dir)
    artifacts += _write_summary_jsons(transform_result, analysis_result, export_dir)

    manifest = {
        "export_id": export_id,
        "generated_at": generated_at,
        "dataset_id": dataset_id,
        "transformation_id": tx_id,
        "artifacts": [
            {
                "name": a["name"],
                "type": a["type"],
                "records": a["records"],
            }
            for a in artifacts
        ],
    }
    manifest_path = os.path.join(export_dir, "manifest.json")
    write_json(manifest, manifest_path)
    artifacts.append({
        "name": "manifest.json",
        "type": "manifest",
        "records": len(artifacts),
        "path": manifest_path,
        "size_bytes": get_file_size(manifest_path),
    })

    zip_name = f"mq_intellimesh_export_{export_id}.zip"
    zip_path = os.path.join(get_exports_base_dir(), zip_name)
    bundle_size = zip_directory(export_dir, zip_path)

    result = {
        "status": "success",
        "message": f"Export bundle generated successfully — {len(artifacts)} artifacts packaged.",
        "export_id": export_id,
        "generated_at": generated_at,
        "dataset_id": dataset_id,
        "transformation_id": tx_id,
        "artifact_count": len(artifacts),
        "artifacts": artifacts,
        "bundle": {
            "name": zip_name,
            "path": zip_path,
            "size_bytes": bundle_size,
        },
        "summary": {
            "total_artifacts": len(artifacts),
            "applications": tx_summary.get("applications", 0),
            "queue_managers_before": tx_summary.get("queue_managers_before", 0),
            "queue_managers_after": tx_summary.get("queue_managers_after", 0),
            "channels_before": tx_summary.get("channels_before", 0),
            "channels_after": tx_summary.get("channels_after", 0),
            "complexity_reduction_percent": complexity.get("reduction_percent", 0.0),
            "compliance_score": validation.get("compliance_score", 0.0),
            "findings_count": len(findings),
            "decisions_count": len(decisions),
            "routes_generated": tx_summary.get("routes_generated", 0),
        },
    }

    global _LATEST_EXPORT
    _LATEST_EXPORT = result

    logger.info(
        "Export complete [%s]: %d artifacts, ZIP=%s (%d bytes)",
        export_id, len(artifacts), zip_name, bundle_size,
    )
    return result


def get_latest_export() -> dict[str, Any] | None:
    if _LATEST_EXPORT:
        return _LATEST_EXPORT
    dirs = list_export_directories()
    if not dirs:
        return None
    latest_dir_name = dirs[0]
    export_dir = os.path.join(get_exports_base_dir(), latest_dir_name)
    manifest_path = os.path.join(export_dir, "manifest.json")
    if not os.path.exists(manifest_path):
        return None
    try:
        manifest = read_json(manifest_path)
        zip_name = f"mq_intellimesh_export_{latest_dir_name}.zip"
        zip_path = os.path.join(get_exports_base_dir(), zip_name)
        return {
            "status": "success",
            "message": "Latest export retrieved from disk.",
            "export_id": manifest.get("export_id", latest_dir_name),
            "generated_at": manifest.get("generated_at", ""),
            "dataset_id": manifest.get("dataset_id", ""),
            "transformation_id": manifest.get("transformation_id", ""),
            "artifact_count": len(manifest.get("artifacts", [])),
            "artifacts": manifest.get("artifacts", []),
            "bundle": {
                "name": zip_name,
                "path": zip_path,
                "size_bytes": get_file_size(zip_path),
            },
            "summary": {},
        }
    except Exception as exc:
        logger.warning("Failed to read latest export manifest: %s", exc)
        return None


def _error(message: str) -> dict[str, Any]:
    return {
        "status": "error",
        "message": message,
        "export_id": "",
        "generated_at": "",
        "dataset_id": "",
        "transformation_id": "",
        "artifact_count": 0,
        "artifacts": [],
        "bundle": None,
        "summary": {},
    }


def _write_target_csvs(target: dict[str, Any], export_dir: str) -> list[dict[str, Any]]:
    artifacts = []

    qms = target.get("queue_managers", [])
    df = pd.DataFrame([
        {
            "qm_name": q.get("qm_name", ""),
            "qm_type": q.get("qm_type", "DEDICATED"),
            "region": q.get("region") or "",
            "environment": q.get("environment") or "",
            "owning_app_count": len(q.get("owning_apps", [])),
            "owning_apps": "|".join(q.get("owning_apps", [])),
        }
        for q in qms
    ])
    path = os.path.join(export_dir, "target_queue_managers.csv")
    size = write_csv(df, path)
    artifacts.append({"name": "target_queue_managers.csv", "type": "target_topology", "records": len(df), "path": path, "size_bytes": size})

    apps = target.get("applications", [])
    df = pd.DataFrame([
        {
            "app_id": a.get("app_id", ""),
            "owning_qm": a.get("owning_qm", ""),
            "role": a.get("role", "both"),
            "assignment_reason": a.get("assignment_reason", ""),
        }
        for a in apps
    ])
    path = os.path.join(export_dir, "target_applications.csv")
    size = write_csv(df, path)
    artifacts.append({"name": "target_applications.csv", "type": "target_topology", "records": len(df), "path": path, "size_bytes": size})

    lqs = target.get("local_queues", [])
    df = pd.DataFrame([
        {
            "queue_name": q.get("queue_name", ""),
            "owning_qm": q.get("owning_qm", ""),
            "consumer_app": q.get("for_app", ""),
            "queue_type": q.get("queue_type", "LOCAL"),
        }
        for q in lqs
    ])
    path = os.path.join(export_dir, "target_local_queues.csv")
    size = write_csv(df, path)
    artifacts.append({"name": "target_local_queues.csv", "type": "target_topology", "records": len(df), "path": path, "size_bytes": size})

    rqs = target.get("remote_queues", [])
    df = pd.DataFrame([
        {
            "queue_name": q.get("queue_name", ""),
            "owning_qm": q.get("owning_qm", ""),
            "target_qm": q.get("remote_qm", ""),
            "target_local_queue": q.get("resolves_to_local", ""),
            "xmitq": q.get("xmit_queue", ""),
            "queue_type": "REMOTE",
        }
        for q in rqs
    ])
    path = os.path.join(export_dir, "target_remote_queues.csv")
    size = write_csv(df, path)
    artifacts.append({"name": "target_remote_queues.csv", "type": "target_topology", "records": len(df), "path": path, "size_bytes": size})

    xqs = target.get("xmit_queues", [])
    df = pd.DataFrame([
        {
            "xmitq_name": q.get("queue_name", ""),
            "source_qm": q.get("owning_qm", ""),
            "target_qm": q.get("target_qm", ""),
        }
        for q in xqs
    ])
    path = os.path.join(export_dir, "target_xmit_queues.csv")
    size = write_csv(df, path)
    artifacts.append({"name": "target_xmit_queues.csv", "type": "target_topology", "records": len(df), "path": path, "size_bytes": size})

    channels = target.get("channels", [])
    df = pd.DataFrame([
        {
            "channel_name": c.get("channel_name", ""),
            "from_qm": c.get("from_qm", ""),
            "to_qm": c.get("to_qm", ""),
            "channel_type": c.get("channel_type", ""),
            "xmit_queue": c.get("xmit_queue") or "",
        }
        for c in channels
    ])
    path = os.path.join(export_dir, "target_channels.csv")
    size = write_csv(df, path)
    artifacts.append({"name": "target_channels.csv", "type": "target_topology", "records": len(df), "path": path, "size_bytes": size})

    routes = target.get("routes", [])
    df = pd.DataFrame([
        {
            "route_id": r.get("route_id", ""),
            "producer_app": r.get("producer_app", ""),
            "consumer_app": r.get("consumer_app", ""),
            "original_queue": r.get("original_queue", ""),
            "source_qm": r.get("producer_qm", ""),
            "target_qm": r.get("consumer_qm", ""),
            "remote_queue": r.get("remote_queue", ""),
            "xmitq": r.get("xmit_queue", ""),
            "sender_channel": r.get("sender_channel", ""),
            "receiver_channel": r.get("receiver_channel", ""),
            "local_queue": r.get("local_queue", ""),
            "same_qm": r.get("same_qm", False),
        }
        for r in routes
    ])
    path = os.path.join(export_dir, "target_routes.csv")
    size = write_csv(df, path)
    artifacts.append({"name": "target_routes.csv", "type": "target_topology", "records": len(df), "path": path, "size_bytes": size})

    return artifacts


def _write_analysis_csvs(
    findings: list[dict[str, Any]],
    decisions: list[dict[str, Any]],
    validation: dict[str, Any],
    complexity: dict[str, Any],
    export_dir: str,
) -> list[dict[str, Any]]:
    artifacts = []

    before = complexity.get("before", {})
    after = complexity.get("after", {})
    before_dims = {d["name"]: d for d in before.get("dimensions", [])}
    after_dims = {d["name"]: d for d in after.get("dimensions", [])}

    dim_rows = []
    all_dim_names = list(before_dims.keys()) or ["qm_count", "channel_count", "routing_hops", "multi_qm_violations", "orphan_objects", "hotspot_penalty"]
    for dname in all_dim_names:
        bd = before_dims.get(dname, {})
        ad = after_dims.get(dname, {})
        bval = bd.get("value", 0.0)
        aval = ad.get("value", 0.0)
        delta = round(bval - aval, 3)
        pct = round((delta / max(bval, 0.001)) * 100, 1) if bval > 0 else 0.0
        dim_rows.append({
            "metric": bd.get("label", dname),
            "as_is": bval,
            "target": aval,
            "delta": delta,
            "reduction_percent": pct,
        })

    dim_rows.append({
        "metric": "Overall Complexity Score (MTCS)",
        "as_is": before.get("total_score", 0.0),
        "target": after.get("total_score", 0.0),
        "delta": round(before.get("total_score", 0.0) - after.get("total_score", 0.0), 2),
        "reduction_percent": complexity.get("reduction_percent", 0.0),
    })

    df = pd.DataFrame(dim_rows)
    path = os.path.join(export_dir, "complexity_comparison.csv")
    size = write_csv(df, path)
    artifacts.append({"name": "complexity_comparison.csv", "type": "analysis", "records": len(df), "path": path, "size_bytes": size})

    df = pd.DataFrame([
        {
            "finding_id": f.get("finding_id", f.get("id", "")),
            "type": f.get("finding_type", f.get("type", "")),
            "category": f.get("category", ""),
            "severity": f.get("severity", ""),
            "subject_type": f.get("subject_type", ""),
            "subject_id": f.get("subject_id", ""),
            "title": f.get("title", ""),
            "description": f.get("description", ""),
            "recommendation": f.get("recommendation", ""),
            "confidence": f.get("confidence", 1.0),
        }
        for f in findings
    ])
    path = os.path.join(export_dir, "analysis_findings.csv")
    size = write_csv(df, path)
    artifacts.append({"name": "analysis_findings.csv", "type": "analysis", "records": len(df), "path": path, "size_bytes": size})

    df = pd.DataFrame([
        {
            "decision_id": d.get("id", ""),
            "decision_type": d.get("decision_type", ""),
            "subject_type": d.get("subject_type", ""),
            "subject_id": d.get("subject_id", ""),
            "title": d.get("title", ""),
            "reason": d.get("reason", ""),
            "impact": d.get("impact", ""),
            "confidence": d.get("confidence", 1.0),
        }
        for d in decisions
    ])
    path = os.path.join(export_dir, "transformation_decisions.csv")
    size = write_csv(df, path)
    artifacts.append({"name": "transformation_decisions.csv", "type": "analysis", "records": len(df), "path": path, "size_bytes": size})

    passed = validation.get("passed_checks", [])
    failed = validation.get("failed_checks", [])
    warnings = validation.get("warnings", [])

    val_rows = []
    for c in passed:
        val_rows.append({
            "check_name": c.get("name", ""),
            "check_id": c.get("check_id", ""),
            "status": "PASS",
            "severity": "INFO",
            "message": c.get("detail", ""),
        })
    for c in failed:
        val_rows.append({
            "check_name": c.get("name", ""),
            "check_id": c.get("check_id", ""),
            "status": "FAIL",
            "severity": "CRITICAL",
            "message": c.get("detail", ""),
        })
    for w in warnings:
        val_rows.append({
            "check_name": "Warning",
            "check_id": "",
            "status": "WARN",
            "severity": "WARNING",
            "message": w,
        })

    df = pd.DataFrame(val_rows)
    path = os.path.join(export_dir, "target_validation.csv")
    size = write_csv(df, path)
    artifacts.append({"name": "target_validation.csv", "type": "validation", "records": len(df), "path": path, "size_bytes": size})

    return artifacts


def _write_summary_jsons(
    transform_result: dict[str, Any],
    analysis_result: dict[str, Any],
    export_dir: str,
) -> list[dict[str, Any]]:
    artifacts = []

    tx_summary = transform_result.get("summary", {})
    complexity = transform_result.get("complexity", {})
    validation = transform_result.get("validation", {})

    export_summary = {
        "product": "MQ IntelliMesh Intelligence Engine",
        "phase": "Phase 7E — Export Engine",
        "transformation_id": transform_result.get("transformation_id", ""),
        "dataset_id": transform_result.get("dataset_id", ""),
        "topology_summary": {
            "applications": tx_summary.get("applications", 0),
            "queue_managers_before": tx_summary.get("queue_managers_before", 0),
            "queue_managers_after": tx_summary.get("queue_managers_after", 0),
            "channels_before": tx_summary.get("channels_before", 0),
            "channels_after": tx_summary.get("channels_after", 0),
            "local_queues_generated": tx_summary.get("local_queues_generated", 0),
            "remote_queues_generated": tx_summary.get("remote_queues_generated", 0),
            "xmit_queues_generated": tx_summary.get("xmit_queues_generated", 0),
            "routes_generated": tx_summary.get("routes_generated", 0),
        },
        "complexity": {
            "before_score": complexity.get("before", {}).get("total_score", 0.0),
            "after_score": complexity.get("after", {}).get("total_score", 0.0),
            "reduction_percent": complexity.get("reduction_percent", 0.0),
            "delta_score": complexity.get("delta_score", 0.0),
        },
        "validation": {
            "compliance_score": validation.get("compliance_score", 0.0),
            "passed_checks": len(validation.get("passed_checks", [])),
            "failed_checks": len(validation.get("failed_checks", [])),
            "warnings": len(validation.get("warnings", [])),
        },
        "analysis": {
            "total_findings": len(analysis_result.get("findings", [])),
            "health_score": analysis_result.get("health_score", 0),
        },
    }

    path = os.path.join(export_dir, "export_summary.json")
    size = write_json(export_summary, path)
    artifacts.append({"name": "export_summary.json", "type": "summary", "records": 1, "path": path, "size_bytes": size})

    transform_summary_doc = {
        "transformation_id": transform_result.get("transformation_id", ""),
        "status": transform_result.get("status", ""),
        "summary": tx_summary,
        "decisions_count": len(transform_result.get("decisions", [])),
        "complexity_reduction_percent": complexity.get("reduction_percent", 0.0),
        "compliance_score": validation.get("compliance_score", 0.0),
    }

    path = os.path.join(export_dir, "transform_summary.json")
    size = write_json(transform_summary_doc, path)
    artifacts.append({"name": "transform_summary.json", "type": "summary", "records": 1, "path": path, "size_bytes": size})

    return artifacts
