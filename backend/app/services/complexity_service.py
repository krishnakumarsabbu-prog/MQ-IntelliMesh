from typing import Any
from app.core.logging import get_logger
from app.utils.graph_utils import (
    build_topology_graph,
    get_nodes_by_type,
    get_total_degree_map,
    get_routing_path_lengths,
    get_orphan_queues,
    get_app_to_qm_connections,
    NODE_TYPE_QM,
    NODE_TYPE_APP,
)
from app.utils.naming_utils import count_naming_violations

logger = get_logger(__name__)

_WEIGHTS = {
    "qm_count": 0.25,
    "channel_count": 0.25,
    "routing_hops": 0.20,
    "multi_qm_violations": 0.15,
    "orphan_objects": 0.10,
    "hotspot_penalty": 0.05,
}

_QM_COUNT_BASELINE = 5
_CHANNEL_COUNT_BASELINE = 8
_HOP_BASELINE = 2.0
_HOTSPOT_DEGREE = 8


def score_topology(topology: dict[str, Any]) -> dict[str, Any]:
    G = build_topology_graph(topology)

    qm_count = len(topology.get("queue_managers", []))
    channel_count = len(topology.get("channels", []))
    app_count = max(len(topology.get("applications", [])), 1)
    queue_count = len(topology.get("queues", []))

    path_data = get_routing_path_lengths(G)
    if path_data:
        avg_hops = sum(p["hops"] for p in path_data) / len(path_data)
    else:
        avg_hops = 0.0

    app_qms = get_app_to_qm_connections(G)
    multi_qm_violations = sum(1 for qms in app_qms.values() if len(qms) > 1)

    orphans = get_orphan_queues(G)
    orphan_count = len(orphans)

    qm_degrees = get_total_degree_map(G, NODE_TYPE_QM)
    hotspot_nodes = sum(1 for d in qm_degrees.values() if d >= _HOTSPOT_DEGREE)
    hotspot_penalty = hotspot_nodes * 2.0

    total_nodes = max(qm_count + queue_count + app_count + channel_count, 1)
    structural_density = (channel_count / total_nodes) * 10.0

    qm_score = min((qm_count / max(_QM_COUNT_BASELINE, 1)) * 30, 100)
    ch_score = min((channel_count / max(_CHANNEL_COUNT_BASELINE, 1)) * 30, 100)
    hop_score = min((avg_hops / max(_HOP_BASELINE, 0.1)) * 25, 100)
    violation_score = min(multi_qm_violations * 15, 100)
    orphan_score = min(orphan_count * 5, 100)
    hotspot_score = min(hotspot_penalty, 100)

    raw_total = (
        qm_score * _WEIGHTS["qm_count"]
        + ch_score * _WEIGHTS["channel_count"]
        + hop_score * _WEIGHTS["routing_hops"]
        + violation_score * _WEIGHTS["multi_qm_violations"]
        + orphan_score * _WEIGHTS["orphan_objects"]
        + hotspot_score * _WEIGHTS["hotspot_penalty"]
    )

    dimensions = [
        {"name": "qm_count", "label": "Queue Manager Count", "value": float(qm_count), "weight": _WEIGHTS["qm_count"], "weighted_score": round(qm_score * _WEIGHTS["qm_count"], 2)},
        {"name": "channel_count", "label": "Channel Count", "value": float(channel_count), "weight": _WEIGHTS["channel_count"], "weighted_score": round(ch_score * _WEIGHTS["channel_count"], 2)},
        {"name": "routing_hops", "label": "Average Routing Hops", "value": round(avg_hops, 2), "weight": _WEIGHTS["routing_hops"], "weighted_score": round(hop_score * _WEIGHTS["routing_hops"], 2)},
        {"name": "multi_qm_violations", "label": "Multi-QM App Violations", "value": float(multi_qm_violations), "weight": _WEIGHTS["multi_qm_violations"], "weighted_score": round(violation_score * _WEIGHTS["multi_qm_violations"], 2)},
        {"name": "orphan_objects", "label": "Orphan / Waste Objects", "value": float(orphan_count), "weight": _WEIGHTS["orphan_objects"], "weighted_score": round(orphan_score * _WEIGHTS["orphan_objects"], 2)},
        {"name": "hotspot_penalty", "label": "Connectivity Hotspot Penalty", "value": round(hotspot_penalty, 2), "weight": _WEIGHTS["hotspot_penalty"], "weighted_score": round(hotspot_score * _WEIGHTS["hotspot_penalty"], 2)},
    ]

    return {
        "total_score": round(raw_total, 2),
        "dimensions": dimensions,
        "queue_manager_count": qm_count,
        "channel_count": channel_count,
        "avg_routing_hops": round(avg_hops, 3),
        "multi_qm_violations": multi_qm_violations,
        "orphan_objects": orphan_count,
        "hotspot_penalty": round(hotspot_penalty, 2),
        "structural_density": round(structural_density, 3),
    }


def score_target_topology(target: dict[str, Any]) -> dict[str, Any]:
    channels = target.get("channels", [])
    qms = target.get("queue_managers", [])
    apps = target.get("applications", [])
    routes = target.get("routes", [])

    qm_count = len(qms)
    channel_count = len(channels)
    app_count = max(len(apps), 1)

    cross_qm_routes = [r for r in routes if not r.get("same_qm", False)]
    avg_hops = 1.0 if cross_qm_routes else 0.5
    multi_qm_violations = 0
    orphan_count = 0

    qm_degree: dict[str, int] = {}
    for ch in channels:
        for qm_key in ("from_qm", "to_qm"):
            qm = ch.get(qm_key)
            if qm:
                qm_degree[qm] = qm_degree.get(qm, 0) + 1
    hotspot_nodes = sum(1 for d in qm_degree.values() if d >= _HOTSPOT_DEGREE)
    hotspot_penalty = hotspot_nodes * 2.0

    total_objects = qm_count + len(target.get("local_queues", [])) + len(target.get("remote_queues", [])) + len(target.get("xmit_queues", [])) + channel_count + app_count
    structural_density = (channel_count / max(total_objects, 1)) * 10.0

    qm_score = min((qm_count / max(_QM_COUNT_BASELINE, 1)) * 30, 100)
    ch_score = min((channel_count / max(_CHANNEL_COUNT_BASELINE, 1)) * 30, 100)
    hop_score = min((avg_hops / max(_HOP_BASELINE, 0.1)) * 25, 100)
    violation_score = 0.0
    orphan_score = 0.0
    hotspot_score = min(hotspot_penalty, 100)

    raw_total = (
        qm_score * _WEIGHTS["qm_count"]
        + ch_score * _WEIGHTS["channel_count"]
        + hop_score * _WEIGHTS["routing_hops"]
        + violation_score * _WEIGHTS["multi_qm_violations"]
        + orphan_score * _WEIGHTS["orphan_objects"]
        + hotspot_score * _WEIGHTS["hotspot_penalty"]
    )

    dimensions = [
        {"name": "qm_count", "label": "Queue Manager Count", "value": float(qm_count), "weight": _WEIGHTS["qm_count"], "weighted_score": round(qm_score * _WEIGHTS["qm_count"], 2)},
        {"name": "channel_count", "label": "Channel Count", "value": float(channel_count), "weight": _WEIGHTS["channel_count"], "weighted_score": round(ch_score * _WEIGHTS["channel_count"], 2)},
        {"name": "routing_hops", "label": "Average Routing Hops", "value": round(avg_hops, 2), "weight": _WEIGHTS["routing_hops"], "weighted_score": round(hop_score * _WEIGHTS["routing_hops"], 2)},
        {"name": "multi_qm_violations", "label": "Multi-QM App Violations", "value": 0.0, "weight": _WEIGHTS["multi_qm_violations"], "weighted_score": 0.0},
        {"name": "orphan_objects", "label": "Orphan / Waste Objects", "value": 0.0, "weight": _WEIGHTS["orphan_objects"], "weighted_score": 0.0},
        {"name": "hotspot_penalty", "label": "Connectivity Hotspot Penalty", "value": round(hotspot_penalty, 2), "weight": _WEIGHTS["hotspot_penalty"], "weighted_score": round(hotspot_score * _WEIGHTS["hotspot_penalty"], 2)},
    ]

    return {
        "total_score": round(raw_total, 2),
        "dimensions": dimensions,
        "queue_manager_count": qm_count,
        "channel_count": channel_count,
        "avg_routing_hops": round(avg_hops, 3),
        "multi_qm_violations": 0,
        "orphan_objects": 0,
        "hotspot_penalty": round(hotspot_penalty, 2),
        "structural_density": round(structural_density, 3),
    }


def compare_complexity(before: dict[str, Any], after: dict[str, Any]) -> dict[str, Any]:
    before_score = before["total_score"]
    after_score = after["total_score"]
    delta = round(before_score - after_score, 2)
    reduction = round((delta / max(before_score, 0.01)) * 100, 1) if before_score > 0 else 0.0
    return {
        "before": before,
        "after": after,
        "reduction_percent": reduction,
        "delta_score": delta,
    }
