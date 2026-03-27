from typing import Any
from app.core.logging import get_logger

logger = get_logger(__name__)

_CHECK_COUNTER = [0]


def _next_check_id() -> str:
    _CHECK_COUNTER[0] += 1
    return f"VC-{_CHECK_COUNTER[0]:03d}"


def validate_target_topology(target: dict[str, Any]) -> dict[str, Any]:
    _CHECK_COUNTER[0] = 0

    passed: list[dict[str, Any]] = []
    failed: list[dict[str, Any]] = []
    warnings: list[str] = []

    apps = target.get("applications", [])
    local_queues = target.get("local_queues", [])
    remote_queues = target.get("remote_queues", [])
    xmit_queues = target.get("xmit_queues", [])
    channels = target.get("channels", [])
    routes = target.get("routes", [])
    qms = target.get("queue_managers", [])

    known_qm_names = {qm["qm_name"] for qm in qms}
    app_qm_map = {a["app_id"]: a["owning_qm"] for a in apps}

    _check_every_app_has_qm(apps, passed, failed)
    _check_no_multi_qm_per_app(apps, passed, failed)
    _check_consumer_queues_are_local(routes, local_queues, passed, failed)
    _check_producer_paths_use_remote_queues(routes, remote_queues, passed, failed)
    _check_inter_qm_routes_have_xmit(routes, xmit_queues, channels, passed, failed)
    _check_no_broken_queue_ownership(local_queues, remote_queues, xmit_queues, known_qm_names, passed, failed, warnings)
    _check_channels_have_valid_endpoints(channels, known_qm_names, passed, failed)
    _check_xmit_queues_have_backing_channel(xmit_queues, channels, passed, failed, warnings)
    _check_no_orphan_routes(routes, local_queues, remote_queues, passed, failed, warnings)

    if not apps:
        warnings.append("No applications found in target topology — transformation may be incomplete.")
    if not routes:
        warnings.append("No routes generated — verify that relationship data was included in ingestion.")

    total_checks = len(passed) + len(failed)
    compliance_score = round((len(passed) / max(total_checks, 1)) * 100, 1)

    logger.info(
        "Target validation complete: %d/%d checks passed, compliance=%.1f%%",
        len(passed), total_checks, compliance_score
    )

    return {
        "compliance_score": compliance_score,
        "passed_checks": passed,
        "failed_checks": failed,
        "warnings": warnings,
        "total_checks": total_checks,
    }


def _check_every_app_has_qm(
    apps: list[dict[str, Any]],
    passed: list, failed: list
) -> None:
    unassigned = [a["app_id"] for a in apps if not a.get("owning_qm")]
    cid = _next_check_id()
    if unassigned:
        failed.append({
            "check_id": cid,
            "name": "Every application has an owning Queue Manager",
            "passed": False,
            "detail": f"{len(unassigned)} application(s) have no owning QM: {', '.join(unassigned[:3])}",
        })
    else:
        passed.append({
            "check_id": cid,
            "name": "Every application has an owning Queue Manager",
            "passed": True,
            "detail": f"All {len(apps)} application(s) have a valid QM assignment.",
        })


def _check_no_multi_qm_per_app(
    apps: list[dict[str, Any]],
    passed: list, failed: list
) -> None:
    seen: dict[str, list[str]] = {}
    for a in apps:
        app_id = a["app_id"]
        qm = a.get("owning_qm")
        if qm:
            seen.setdefault(app_id, []).append(qm)
    violations = {k: v for k, v in seen.items() if len(v) > 1}
    cid = _next_check_id()
    if violations:
        failed.append({
            "check_id": cid,
            "name": "No application connected to multiple Queue Managers",
            "passed": False,
            "detail": f"{len(violations)} app(s) still have multiple QMs in target: {list(violations.keys())[:3]}",
        })
    else:
        passed.append({
            "check_id": cid,
            "name": "No application connected to multiple Queue Managers",
            "passed": True,
            "detail": "One-QM-per-application constraint satisfied for all applications.",
        })


def _check_consumer_queues_are_local(
    routes: list[dict[str, Any]],
    local_queues: list[dict[str, Any]],
    passed: list, failed: list
) -> None:
    local_queue_names = {q["queue_name"] for q in local_queues}
    non_local = [r["local_queue"] for r in routes if r.get("local_queue") and r["local_queue"] not in local_queue_names]
    cid = _next_check_id()
    if non_local:
        failed.append({
            "check_id": cid,
            "name": "Consumer queues are defined as LOCAL queues",
            "passed": False,
            "detail": f"{len(non_local)} route(s) reference consumer queues not in local queue registry.",
        })
    else:
        passed.append({
            "check_id": cid,
            "name": "Consumer queues are defined as LOCAL queues",
            "passed": True,
            "detail": f"All {len(routes)} route(s) use local queues for consumer endpoints.",
        })


def _check_producer_paths_use_remote_queues(
    routes: list[dict[str, Any]],
    remote_queues: list[dict[str, Any]],
    passed: list, failed: list
) -> None:
    remote_queue_names = {q["queue_name"] for q in remote_queues}
    cross_qm_routes = [r for r in routes if not r.get("same_qm", False)]
    missing = [r["remote_queue"] for r in cross_qm_routes if r.get("remote_queue") and r["remote_queue"] not in remote_queue_names]
    cid = _next_check_id()
    if missing:
        failed.append({
            "check_id": cid,
            "name": "Producers route through REMOTE queues for cross-QM flows",
            "passed": False,
            "detail": f"{len(missing)} cross-QM route(s) missing corresponding remote queue definition.",
        })
    elif cross_qm_routes:
        passed.append({
            "check_id": cid,
            "name": "Producers route through REMOTE queues for cross-QM flows",
            "passed": True,
            "detail": f"All {len(cross_qm_routes)} cross-QM route(s) have corresponding remote queue definitions.",
        })
    else:
        passed.append({
            "check_id": cid,
            "name": "Producers route through REMOTE queues for cross-QM flows",
            "passed": True,
            "detail": "No cross-QM routes required — all flows are same-QM.",
        })


def _check_inter_qm_routes_have_xmit(
    routes: list[dict[str, Any]],
    xmit_queues: list[dict[str, Any]],
    channels: list[dict[str, Any]],
    passed: list, failed: list
) -> None:
    xmit_names = {q["queue_name"] for q in xmit_queues}
    channel_pairs = {(c["from_qm"], c["to_qm"]) for c in channels if c.get("channel_type") == "SDR"}
    cross_qm_routes = [r for r in routes if not r.get("same_qm", False)]

    missing_xmit = [r for r in cross_qm_routes if r.get("xmit_queue") and r["xmit_queue"] not in xmit_names]
    missing_channel = [r for r in cross_qm_routes if (r.get("producer_qm"), r.get("consumer_qm")) not in channel_pairs]

    cid = _next_check_id()
    if missing_xmit or missing_channel:
        failed.append({
            "check_id": cid,
            "name": "All inter-QM routes have XMIT queue and sender channel",
            "passed": False,
            "detail": f"{len(missing_xmit)} route(s) missing XMIT queue; {len(missing_channel)} route(s) missing sender channel.",
        })
    elif cross_qm_routes:
        passed.append({
            "check_id": cid,
            "name": "All inter-QM routes have XMIT queue and sender channel",
            "passed": True,
            "detail": f"All {len(cross_qm_routes)} inter-QM routes have complete XMIT and channel support.",
        })
    else:
        passed.append({
            "check_id": cid,
            "name": "All inter-QM routes have XMIT queue and sender channel",
            "passed": True,
            "detail": "No inter-QM routes required in this topology.",
        })


def _check_no_broken_queue_ownership(
    local_queues: list, remote_queues: list, xmit_queues: list,
    known_qms: set,
    passed: list, failed: list, warnings: list
) -> None:
    broken = []
    for q in local_queues + remote_queues + xmit_queues:
        owning = q.get("owning_qm")
        if owning and known_qms and owning not in known_qms:
            broken.append(q.get("queue_name"))
    cid = _next_check_id()
    if broken:
        failed.append({
            "check_id": cid,
            "name": "All target queues have valid owning Queue Manager",
            "passed": False,
            "detail": f"{len(broken)} queue(s) reference a QM not in the target topology.",
        })
    else:
        total = len(local_queues) + len(remote_queues) + len(xmit_queues)
        passed.append({
            "check_id": cid,
            "name": "All target queues have valid owning Queue Manager",
            "passed": True,
            "detail": f"All {total} target queue(s) have valid Queue Manager ownership.",
        })


def _check_channels_have_valid_endpoints(
    channels: list[dict[str, Any]],
    known_qms: set,
    passed: list, failed: list
) -> None:
    broken = [
        c["channel_name"] for c in channels
        if known_qms and (c.get("from_qm") not in known_qms or c.get("to_qm") not in known_qms)
    ]
    cid = _next_check_id()
    if broken:
        failed.append({
            "check_id": cid,
            "name": "All channels reference valid Queue Manager endpoints",
            "passed": False,
            "detail": f"{len(broken)} channel(s) reference QMs not in the target topology.",
        })
    else:
        passed.append({
            "check_id": cid,
            "name": "All channels reference valid Queue Manager endpoints",
            "passed": True,
            "detail": f"All {len(channels)} channel(s) have valid from_qm and to_qm endpoints.",
        })


def _check_xmit_queues_have_backing_channel(
    xmit_queues: list[dict[str, Any]],
    channels: list[dict[str, Any]],
    passed: list, failed: list, warnings: list
) -> None:
    sdr_pairs = {(c["from_qm"], c["to_qm"]) for c in channels if c.get("channel_type") == "SDR"}
    missing = [
        x["queue_name"] for x in xmit_queues
        if (x.get("owning_qm"), x.get("target_qm")) not in sdr_pairs
    ]
    cid = _next_check_id()
    if missing:
        warnings.append(
            f"{len(missing)} XMIT queue(s) lack a backing SDR channel — "
            f"may indicate incomplete channel generation."
        )
        passed.append({
            "check_id": cid,
            "name": "XMIT queues have backing SDR channels",
            "passed": True,
            "detail": f"Warning raised for {len(missing)} XMIT queue(s) — check warnings list.",
        })
    else:
        passed.append({
            "check_id": cid,
            "name": "XMIT queues have backing SDR channels",
            "passed": True,
            "detail": f"All {len(xmit_queues)} XMIT queue(s) have a corresponding SDR channel.",
        })


def _check_no_orphan_routes(
    routes: list[dict[str, Any]],
    local_queues: list[dict[str, Any]],
    remote_queues: list[dict[str, Any]],
    passed: list, failed: list, warnings: list
) -> None:
    lq_names = {q["queue_name"] for q in local_queues}
    rq_names = {q["queue_name"] for q in remote_queues}
    orphan_routes = [
        r["route_id"] for r in routes
        if r.get("local_queue") not in lq_names or (
            not r.get("same_qm") and r.get("remote_queue") not in rq_names
        )
    ]
    cid = _next_check_id()
    if orphan_routes:
        failed.append({
            "check_id": cid,
            "name": "All routes have resolvable queue objects",
            "passed": False,
            "detail": f"{len(orphan_routes)} route(s) reference queues not in the target queue registry.",
        })
    else:
        passed.append({
            "check_id": cid,
            "name": "All routes have resolvable queue objects",
            "passed": True,
            "detail": f"All {len(routes)} route(s) resolve to valid target queue objects.",
        })
