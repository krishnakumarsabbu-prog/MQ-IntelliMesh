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
    artifacts += _write_hackathon_denormalized_csv(target, topology, transform_result, export_dir)
    artifacts += _write_security_policies_csv(target, export_dir)
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


def _write_hackathon_denormalized_csv(
    target: dict[str, Any],
    topology: dict[str, Any],
    transform_result: dict[str, Any],
    export_dir: str,
) -> list[dict[str, Any]]:
    routes = target.get("routes", [])
    local_queues = target.get("local_queues", [])
    remote_queues = target.get("remote_queues", [])
    xmit_queues = target.get("xmit_queues", [])
    channels = target.get("channels", [])
    apps = target.get("applications", [])
    qms = target.get("queue_managers", [])
    security_policies = target.get("security_policies", [])

    app_meta: dict[str, dict] = {a["app_id"]: a for a in apps}
    app_sec: dict[str, dict] = {}
    for p in security_policies:
        if p.get("app_id"):
            app_sec[p["app_id"]] = p

    as_is_apps: dict[str, dict] = {
        a.get("app_id", ""): a
        for a in topology.get("applications", [])
        if a.get("app_id")
    }

    lq_by_name: dict[str, dict] = {q["queue_name"]: q for q in local_queues}
    rq_by_name: dict[str, dict] = {q["queue_name"]: q for q in remote_queues}
    xq_by_name: dict[str, dict] = {q["queue_name"]: q for q in xmit_queues}

    sdr_by_pair: dict[tuple[str, str], str] = {}
    rcvr_by_pair: dict[tuple[str, str], str] = {}
    for ch in channels:
        pair = (ch.get("from_qm", ""), ch.get("to_qm", ""))
        if ch.get("channel_type") == "SDR":
            sdr_by_pair[pair] = ch.get("channel_name", "")
        elif ch.get("channel_type") == "RCVR":
            rcvr_by_pair[pair] = ch.get("channel_name", "")

    rows = []

    for route in routes:
        producer_app = route.get("producer_app", "")
        consumer_app = route.get("consumer_app", "")
        producer_qm = route.get("producer_qm", "")
        consumer_qm = route.get("consumer_qm", "")
        local_queue = route.get("local_queue", "")
        remote_queue = route.get("remote_queue", "")
        xmit_queue = route.get("xmit_queue", "")
        same_qm = route.get("same_qm", False)

        producer_meta = app_meta.get(producer_app, {})
        producer_as_is = as_is_apps.get(producer_app, {})
        producer_sec = app_sec.get(producer_app, {})

        lq_info = lq_by_name.get(local_queue, {})
        xq_info = xq_by_name.get(xmit_queue, {})

        lob = producer_as_is.get("line_of_business") or producer_meta.get("owning_team") or ""
        neighborhood = producer_as_is.get("neighborhood") or ""
        hosting = producer_as_is.get("hosting_type") or producer_meta.get("hosting_type") or ""
        data_class = producer_as_is.get("data_classification") or producer_meta.get("data_classification") or "Internal"
        compliance_tags = producer_as_is.get("compliance_tags") or producer_meta.get("compliance_tags") or []
        pci_val = "Yes" if "PCI" in compliance_tags else "No"
        ssl_cipher = producer_sec.get("ssl_cipher_spec", "TLS_RSA_WITH_AES_128_CBC_SHA256")

        rows.append({
            "Discrete Queue Name": local_queue,
            "ProducerName": producer_app,
            "ConsumerName": consumer_app,
            "Primary App_Full_Name": producer_as_is.get("description") or producer_app,
            "PrimaryAppDisp": producer_meta.get("role", ""),
            "PrimaryAppRole": producer_meta.get("role", ""),
            "Primary Application Id q_type": f"{producer_app} LOCAL",
            "Primary Neighborhood": neighborhood,
            "Primary Hosting Type": hosting,
            "Primary Data Classification": data_class,
            "Primary Enterprise Critical Payment Application": "No",
            "Primary PCI": pci_val,
            "Primary Publicly Accessible": "No",
            "Primary TRTC": "",
            "q_type": "Local",
            "q_manager_name": consumer_qm,
            "app_id": producer_app,
            "line_of_business": lob,
            "cluster_name": "",
            "cluster_namelist": "",
            "def_persistence": "Yes",
            "def_put_response": "Asynchronous",
            "inhibit_get": "No",
            "inhibit_put": "No",
            "remote_q_mgr_name": "",
            "remote_q_name": "",
            "usage": "Normal",
            "xmit_q_name": "",
            "Neighborhood": neighborhood,
        })

        if not same_qm and remote_queue:
            rq_info = rq_by_name.get(remote_queue, {})
            rows.append({
                "Discrete Queue Name": remote_queue,
                "ProducerName": producer_app,
                "ConsumerName": consumer_app,
                "Primary App_Full_Name": producer_as_is.get("description") or producer_app,
                "PrimaryAppDisp": producer_meta.get("role", ""),
                "PrimaryAppRole": producer_meta.get("role", ""),
                "Primary Application Id q_type": f"{producer_app} Remote",
                "Primary Neighborhood": neighborhood,
                "Primary Hosting Type": hosting,
                "Primary Data Classification": data_class,
                "Primary Enterprise Critical Payment Application": "No",
                "Primary PCI": pci_val,
                "Primary Publicly Accessible": "No",
                "Primary TRTC": "",
                "q_type": "Remote",
                "q_manager_name": producer_qm,
                "app_id": producer_app,
                "line_of_business": lob,
                "cluster_name": "",
                "cluster_namelist": "",
                "def_persistence": "Yes",
                "def_put_response": "Asynchronous",
                "inhibit_get": "No",
                "inhibit_put": "No",
                "remote_q_mgr_name": consumer_qm,
                "remote_q_name": local_queue,
                "usage": "Normal",
                "xmit_q_name": xmit_queue,
                "Neighborhood": neighborhood,
            })

        if not same_qm and xmit_queue:
            rows.append({
                "Discrete Queue Name": xmit_queue,
                "ProducerName": "",
                "ConsumerName": "",
                "Primary App_Full_Name": "",
                "PrimaryAppDisp": "Transmission Queue",
                "PrimaryAppRole": "Infrastructure",
                "Primary Application Id q_type": f"{producer_qm} XMITQ",
                "Primary Neighborhood": neighborhood,
                "Primary Hosting Type": hosting,
                "Primary Data Classification": "Internal",
                "Primary Enterprise Critical Payment Application": "No",
                "Primary PCI": "No",
                "Primary Publicly Accessible": "No",
                "Primary TRTC": "",
                "q_type": "Local",
                "q_manager_name": producer_qm,
                "app_id": "",
                "line_of_business": lob,
                "cluster_name": "",
                "cluster_namelist": "",
                "def_persistence": "Yes",
                "def_put_response": "Asynchronous",
                "inhibit_get": "No",
                "inhibit_put": "No",
                "remote_q_mgr_name": "",
                "remote_q_name": "",
                "usage": "Transmission",
                "xmit_q_name": "",
                "Neighborhood": neighborhood,
            })

    seen_route_keys: set[tuple] = set()
    deduped = []
    for row in rows:
        key = (row["Discrete Queue Name"], row["ProducerName"], row["ConsumerName"], row["q_manager_name"])
        if key not in seen_route_keys:
            seen_route_keys.add(key)
            deduped.append(row)

    df = pd.DataFrame(deduped) if deduped else pd.DataFrame(columns=[
        "Discrete Queue Name", "ProducerName", "ConsumerName",
        "Primary App_Full_Name", "PrimaryAppDisp", "PrimaryAppRole",
        "Primary Application Id q_type", "Primary Neighborhood", "Primary Hosting Type",
        "Primary Data Classification", "Primary Enterprise Critical Payment Application",
        "Primary PCI", "Primary Publicly Accessible", "Primary TRTC",
        "q_type", "q_manager_name", "app_id", "line_of_business",
        "cluster_name", "cluster_namelist", "def_persistence", "def_put_response",
        "inhibit_get", "inhibit_put", "remote_q_mgr_name", "remote_q_name",
        "usage", "xmit_q_name", "Neighborhood",
    ])

    path = os.path.join(export_dir, "target_topology_hackathon_format.csv")
    size = write_csv(df, path)
    return [{"name": "target_topology_hackathon_format.csv", "type": "target_topology_denormalized", "records": len(df), "path": path, "size_bytes": size}]


def _write_security_policies_csv(
    target: dict[str, Any],
    export_dir: str,
) -> list[dict[str, Any]]:
    policies = target.get("security_policies", [])

    app_policies = [p for p in policies if p.get("app_id")]
    channel_policies = [p for p in policies if p.get("channel_name")]

    app_rows = [
        {
            "policy_id": p.get("policy_id", ""),
            "app_id": p.get("app_id", ""),
            "owning_qm": p.get("owning_qm", ""),
            "mq_auth_enabled": p.get("mq_auth_enabled", True),
            "ssl_cipher_spec": p.get("ssl_cipher_spec", ""),
            "channel_auth_record": p.get("channel_auth_record", ""),
            "put_authority": p.get("put_authority", "DEFAULT"),
            "get_authority": p.get("get_authority", "DEFAULT"),
            "encryption_required": p.get("encryption_required", False),
            "pci_scoped": p.get("pci_scoped", False),
            "compliance_tags": "|".join(p.get("compliance_tags", [])),
        }
        for p in app_policies
    ]
    df_apps = pd.DataFrame(app_rows) if app_rows else pd.DataFrame()
    path_apps = os.path.join(export_dir, "security_policies_applications.csv")
    size_apps = write_csv(df_apps, path_apps)

    ch_rows = [
        {
            "policy_id": p.get("policy_id", ""),
            "channel_name": p.get("channel_name", ""),
            "from_qm": p.get("from_qm", ""),
            "to_qm": p.get("to_qm", ""),
            "ssl_cipher_spec": p.get("ssl_cipher_spec", ""),
            "ssl_client_auth": p.get("ssl_client_auth", "REQUIRED"),
            "mca_user_id": p.get("mca_user_id", ""),
            "heartbeat_interval": p.get("heartbeat_interval", 300),
            "max_msg_length": p.get("max_msg_length", 104857600),
        }
        for p in channel_policies
    ]
    df_chs = pd.DataFrame(ch_rows) if ch_rows else pd.DataFrame()
    path_chs = os.path.join(export_dir, "security_policies_channels.csv")
    size_chs = write_csv(df_chs, path_chs)

    artifacts = []
    artifacts.append({"name": "security_policies_applications.csv", "type": "security", "records": len(df_apps), "path": path_apps, "size_bytes": size_apps})
    artifacts.append({"name": "security_policies_channels.csv", "type": "security", "records": len(df_chs), "path": path_chs, "size_bytes": size_chs})
    return artifacts
