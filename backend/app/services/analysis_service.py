from typing import Any
from app.core.logging import get_logger
from app.utils.graph_utils import (
    build_topology_graph,
    get_app_to_qm_connections,
    get_orphan_queues,
    get_qm_app_ownership,
    get_total_degree_map,
    detect_cycles,
    find_duplicate_qm_pairs,
    get_routing_path_lengths,
    get_centrality_scores,
    get_nodes_by_type,
    NODE_TYPE_QM,
    NODE_TYPE_QUEUE,
    NODE_TYPE_APP,
)
from app.utils.scoring_utils import (
    compute_health_score,
    count_by_severity,
    count_by_category,
    count_policy_violations,
    count_simplification_opportunities,
    severity_rank,
)

logger = get_logger(__name__)

_FINDING_COUNTER = [0]

_MULTI_QM_THRESHOLD = 1
_ORPHAN_QUEUE_MIN = 1
_REDUNDANT_CHANNEL_THRESHOLD = 1
_HOP_COMPLEXITY_THRESHOLD = 5
_FANOUT_APP_DEGREE_THRESHOLD = 5
_FANOUT_QM_DEGREE_THRESHOLD = 8
_CENTRALITY_HOTSPOT_THRESHOLD = 0.15


def _next_id() -> str:
    _FINDING_COUNTER[0] += 1
    return f"F-{_FINDING_COUNTER[0]:03d}"


def analyze_topology(dataset_id: str | None = None) -> dict[str, Any]:
    from app.services.ingest_service import get_topology, list_datasets, get_dataset_summary

    if dataset_id:
        topology = get_topology(dataset_id)
        if topology is None:
            return _no_dataset_error(dataset_id)
    else:
        all_ids = list_datasets()
        if not all_ids:
            return _no_dataset_error(None)
        dataset_id = all_ids[-1]
        topology = get_topology(dataset_id)
        if topology is None:
            return _no_dataset_error(dataset_id)

    _FINDING_COUNTER[0] = 0

    logger.info("Running Phase 7C findings engine on dataset_id=%s", dataset_id)

    G = build_topology_graph(topology)

    findings: list[dict[str, Any]] = []

    findings.extend(_check_multi_qm_applications(G))
    findings.extend(_check_orphan_queues(G, topology))
    findings.extend(_check_low_value_queue_managers(G, topology))
    findings.extend(_check_redundant_channels(G, topology))
    findings.extend(_check_routing_complexity(G))
    findings.extend(_check_fanin_fanout_hotspots(G))
    findings.extend(_check_cycles(G))
    findings.extend(_check_unknown_references(topology))
    findings.extend(_check_policy_drift(G, topology))
    findings.extend(_check_single_points_of_failure(G))

    findings.sort(key=lambda f: severity_rank(f["severity"]), reverse=True)

    severity_counts = count_by_severity(findings)
    category_counts = count_by_category(findings)
    policy_violations = count_policy_violations(findings)
    simplification_ops = count_simplification_opportunities(findings)
    critical_and_high = severity_counts.get("critical", 0) + severity_counts.get("high", 0)

    hotspots = _extract_hotspots(findings, G)
    health = compute_health_score(findings, topology)

    topology_stats = {
        "queue_managers": len(topology.get("queue_managers", [])),
        "queues": len(topology.get("queues", [])),
        "applications": len(topology.get("applications", [])),
        "channels": len(topology.get("channels", [])),
        "relationships": len(topology.get("relationships", [])),
    }

    logger.info(
        "Analysis complete [%s]: %d findings, health=%d (%s), hotspots=%d",
        dataset_id,
        len(findings),
        health["score"],
        health["label"],
        len(hotspots),
    )

    return {
        "status": "success",
        "message": "As-is topology analysis completed",
        "dataset_id": dataset_id,
        "summary": {
            "total_findings": len(findings),
            "severity_breakdown": severity_counts,
            "category_breakdown": category_counts,
            "policy_violations": policy_violations,
            "hotspots": len(hotspots),
            "simplification_opportunities": simplification_ops,
            "critical_and_high": critical_and_high,
        },
        "health": health,
        "hotspots": hotspots,
        "findings": findings,
        "topology_stats": topology_stats,
    }


def _no_dataset_error(dataset_id: str | None) -> dict[str, Any]:
    return {
        "status": "error",
        "message": "No topology dataset available. Please ingest MQ CSV files first via POST /api/ingest.",
        "dataset_id": dataset_id or "",
        "summary": {},
        "health": {"score": 0, "label": "Unknown", "contributing_factors": []},
        "hotspots": [],
        "findings": [],
        "topology_stats": {},
    }


def _check_multi_qm_applications(G) -> list[dict[str, Any]]:
    findings = []
    app_to_qms = get_app_to_qm_connections(G)
    for app_id, connected_qms in app_to_qms.items():
        if len(connected_qms) > _MULTI_QM_THRESHOLD:
            findings.append({
                "id": _next_id(),
                "type": "MULTI_QM_APPLICATION",
                "category": "Policy Violation",
                "severity": "high",
                "subject_type": "application",
                "subject_id": app_id,
                "title": f"Application connected to {len(connected_qms)} Queue Managers",
                "description": (
                    f"'{app_id}' has direct connections to {len(connected_qms)} Queue Managers: "
                    f"{', '.join(connected_qms)}. The target architecture requires exactly one "
                    f"owning Queue Manager per application."
                ),
                "impact": (
                    "Violates the one-QM-per-application target policy. Creates ambiguous ownership, "
                    "increases coupling, and complicates fault isolation during outages."
                ),
                "recommendation": (
                    f"Assign '{app_id}' to a single owning Queue Manager. Route all cross-QM "
                    f"communication through deterministic MQ channel patterns."
                ),
                "evidence": {
                    "connected_qms": connected_qms,
                    "connection_count": len(connected_qms),
                },
                "confidence": 0.97,
            })
    return findings


def _check_orphan_queues(G, topology: dict[str, Any]) -> list[dict[str, Any]]:
    findings = []
    orphans = get_orphan_queues(G)

    rel_queues = {
        r.get("queue_name")
        for r in topology.get("relationships", [])
        if r.get("queue_name")
    }

    true_orphans = [q for q in orphans if q not in rel_queues]

    for queue_name in true_orphans:
        owning_qm = None
        for q in topology.get("queues", []):
            if q.get("queue_name") == queue_name:
                owning_qm = q.get("owning_qm")
                break

        findings.append({
            "id": _next_id(),
            "type": "ORPHAN_QUEUE",
            "category": "Topology Waste",
            "severity": "medium",
            "subject_type": "queue",
            "subject_id": queue_name,
            "title": f"Orphan queue with no producer or consumer: '{queue_name}'",
            "description": (
                f"Queue '{queue_name}' is owned by '{owning_qm}' but has no connected producer "
                f"applications, consumer applications, or active message flow relationships. "
                f"It exists as unused topology."
            ),
            "impact": (
                "Increases QM configuration footprint, obscures intent, and adds maintenance burden "
                "during topology transformation and migration planning."
            ),
            "recommendation": (
                f"Confirm whether '{queue_name}' is still in use. If not, decommission it from "
                f"'{owning_qm}' to reduce topology noise and simplify the transformation scope."
            ),
            "evidence": {
                "owning_qm": owning_qm,
                "producer_count": 0,
                "consumer_count": 0,
            },
            "confidence": 0.85,
        })
    return findings


def _check_low_value_queue_managers(G, topology: dict[str, Any]) -> list[dict[str, Any]]:
    findings = []
    qm_apps = get_qm_app_ownership(G)
    qm_queue_counts: dict[str, int] = {}

    for q in topology.get("queues", []):
        owning = q.get("owning_qm")
        if owning:
            qm_queue_counts[owning] = qm_queue_counts.get(owning, 0) + 1

    all_qm_names = {qm.get("qm_name") for qm in topology.get("queue_managers", []) if qm.get("qm_name")}

    for qm_name in all_qm_names:
        app_count = len(qm_apps.get(qm_name, []))
        queue_count = qm_queue_counts.get(qm_name, 0)

        from_channels = [
            ch for ch in topology.get("channels", [])
            if ch.get("from_qm") == qm_name or ch.get("to_qm") == qm_name
        ]

        if app_count == 0 and queue_count == 0 and len(from_channels) == 0:
            findings.append({
                "id": _next_id(),
                "type": "UNUSED_QUEUE_MANAGER",
                "category": "Simplification Opportunity",
                "severity": "medium",
                "subject_type": "queue_manager",
                "subject_id": qm_name,
                "title": f"Queue Manager '{qm_name}' has no assigned applications, queues, or channels",
                "description": (
                    f"'{qm_name}' appears to serve no meaningful role in the current topology. "
                    f"It has 0 connected applications, 0 owned queues, and 0 channel endpoints."
                ),
                "impact": (
                    "Idle Queue Managers consume platform resources and add configuration surface area "
                    "without contributing to message flow."
                ),
                "recommendation": (
                    f"Verify whether '{qm_name}' serves a latent or undocumented function. "
                    f"If not, consider decommissioning to reduce the transformation footprint."
                ),
                "evidence": {
                    "connected_apps": 0,
                    "owned_queues": 0,
                    "channel_endpoints": 0,
                },
                "confidence": 0.88,
            })
        elif app_count == 0 and queue_count > 0:
            findings.append({
                "id": _next_id(),
                "type": "UNMAPPED_QUEUE_MANAGER",
                "category": "Governance Drift",
                "severity": "low",
                "subject_type": "queue_manager",
                "subject_id": qm_name,
                "title": f"Queue Manager '{qm_name}' owns queues but has no connected applications",
                "description": (
                    f"'{qm_name}' owns {queue_count} queue(s) but no application is directly "
                    f"connected to it. This may indicate application-to-QM mapping gaps."
                ),
                "impact": (
                    "Ambiguous ownership during migration. Target state assignment will be "
                    "non-deterministic without explicit application-QM mapping."
                ),
                "recommendation": (
                    f"Map at least one application to '{qm_name}' to establish clear ownership, "
                    f"or reassign its queues to a QM that has known application ownership."
                ),
                "evidence": {
                    "owned_queues": queue_count,
                    "connected_apps": 0,
                },
                "confidence": 0.82,
            })
    return findings


def _check_redundant_channels(G, topology: dict[str, Any]) -> list[dict[str, Any]]:
    findings = []
    duplicate_pairs = find_duplicate_qm_pairs(G)

    for from_qm, to_qm, count in duplicate_pairs:
        matching_channels = [
            ch.get("channel_name")
            for ch in topology.get("channels", [])
            if ch.get("from_qm") == from_qm and ch.get("to_qm") == to_qm
        ]
        findings.append({
            "id": _next_id(),
            "type": "REDUNDANT_CHANNELS",
            "category": "Topology Waste",
            "severity": "medium",
            "subject_type": "queue_manager",
            "subject_id": from_qm,
            "title": f"{count} channels defined between '{from_qm}' and '{to_qm}'",
            "description": (
                f"There are {count} channel definitions routing between '{from_qm}' and '{to_qm}'. "
                f"Multiple channels for the same QM pair may indicate channel sprawl, "
                f"legacy duplication, or uncoordinated configuration changes."
            ),
            "impact": (
                "Redundant channels increase the operational footprint, complicate channel "
                "lifecycle management, and can create ambiguous routing behavior."
            ),
            "recommendation": (
                f"Review all channels between '{from_qm}' and '{to_qm}'. "
                f"Consolidate to the minimum required set. Document the intent of each retained channel."
            ),
            "evidence": {
                "from_qm": from_qm,
                "to_qm": to_qm,
                "channel_count": count,
                "channels": matching_channels,
            },
            "confidence": 0.93,
        })

    pair_map: dict[frozenset, list[str]] = {}
    for ch in topology.get("channels", []):
        from_qm = ch.get("from_qm")
        to_qm = ch.get("to_qm")
        ch_name = ch.get("channel_name")
        if from_qm and to_qm and ch_name:
            key = frozenset([from_qm, to_qm])
            pair_map.setdefault(key, []).append(ch_name)

    for key, channels in pair_map.items():
        if len(channels) > 3:
            parts = list(key)
            findings.append({
                "id": _next_id(),
                "type": "CHANNEL_PROLIFERATION",
                "category": "Topology Waste",
                "severity": "low",
                "subject_type": "channel",
                "subject_id": channels[0],
                "title": f"High channel density between {parts[0]} and {parts[1]} ({len(channels)} channels)",
                "description": (
                    f"The QM pair {parts[0]}—{parts[1]} has {len(channels)} channel definitions. "
                    f"This level of channel density is atypical and may indicate configuration sprawl."
                ),
                "impact": (
                    "Excess channels increase configuration surface, inflate monitoring scope, "
                    "and slow down transformation analysis."
                ),
                "recommendation": (
                    f"Audit and rationalize channels between {parts[0]} and {parts[1]}. "
                    f"Target a minimal, explicitly intentioned channel set."
                ),
                "evidence": {
                    "qm_pair": list(key),
                    "channel_count": len(channels),
                    "channels": channels[:5],
                },
                "confidence": 0.80,
            })

    return findings


def _check_routing_complexity(G) -> list[dict[str, Any]]:
    findings = []
    path_lengths = get_routing_path_lengths(G)

    complex_paths = [p for p in path_lengths if p["hops"] >= _HOP_COMPLEXITY_THRESHOLD]

    for path in complex_paths[:10]:
        findings.append({
            "id": _next_id(),
            "type": "EXCESSIVE_ROUTING_HOPS",
            "category": "Routing Risk",
            "severity": "medium",
            "subject_type": "application",
            "subject_id": path["source"],
            "title": (
                f"Complex routing path: {path['source']} to {path['target']} spans {path['hops']} hops"
            ),
            "description": (
                f"The shortest undirected path between application '{path['source']}' and "
                f"'{path['target']}' traverses {path['hops']} nodes. "
                f"Deep routing paths indicate excessive intermediary topology."
            ),
            "impact": (
                "High hop counts increase message latency, complicate failure diagnosis, "
                "and make transformation planning harder when rationalizing routing flows."
            ),
            "recommendation": (
                f"Review the routing path between '{path['source']}' and '{path['target']}'. "
                f"Consider introducing direct QM peering or consolidating intermediate routing nodes "
                f"to reduce structural depth."
            ),
            "evidence": {
                "source": path["source"],
                "target": path["target"],
                "hop_count": path["hops"],
            },
            "confidence": 0.75,
        })
    return findings


def _check_fanin_fanout_hotspots(G) -> list[dict[str, Any]]:
    findings = []

    app_degrees = get_total_degree_map(G, NODE_TYPE_APP)
    for app_id, degree in app_degrees.items():
        if degree >= _FANOUT_APP_DEGREE_THRESHOLD:
            findings.append({
                "id": _next_id(),
                "type": "APP_FAN_OUT_HOTSPOT",
                "category": "Operational Risk",
                "severity": "high" if degree >= _FANOUT_APP_DEGREE_THRESHOLD * 2 else "medium",
                "subject_type": "application",
                "subject_id": app_id,
                "title": f"Application '{app_id}' is a connectivity hotspot (degree={degree})",
                "description": (
                    f"Application '{app_id}' has {degree} topology connections — "
                    f"significantly above the expected norm. "
                    f"High-degree applications accumulate structural dependency risk."
                ),
                "impact": (
                    "Hotspot applications become single points of coupling. Any change to their "
                    "QM assignment or queue bindings during migration risks cascading impact."
                ),
                "recommendation": (
                    f"Review whether '{app_id}' can be decomposed or its message flows split "
                    f"across dedicated channels. Aim to reduce degree below {_FANOUT_APP_DEGREE_THRESHOLD}."
                ),
                "evidence": {"degree": degree},
                "confidence": 0.90,
            })

    qm_degrees = get_total_degree_map(G, NODE_TYPE_QM)
    for qm_name, degree in qm_degrees.items():
        if degree >= _FANOUT_QM_DEGREE_THRESHOLD:
            findings.append({
                "id": _next_id(),
                "type": "QM_OVERLOAD_HOTSPOT",
                "category": "Operational Risk",
                "severity": "high" if degree >= _FANOUT_QM_DEGREE_THRESHOLD * 2 else "medium",
                "subject_type": "queue_manager",
                "subject_id": qm_name,
                "title": f"Queue Manager '{qm_name}' is a topology hub (degree={degree})",
                "description": (
                    f"Queue Manager '{qm_name}' has {degree} total topology connections "
                    f"(apps, queues, channels combined). Highly connected QMs become concentration risk nodes."
                ),
                "impact": (
                    "Over-loaded Queue Managers create a hub-and-spoke dependency pattern that "
                    "contradicts target-state autonomous domain architecture."
                ),
                "recommendation": (
                    f"Evaluate offloading some queue ownership or application connections from '{qm_name}' "
                    f"to neighboring QMs or new dedicated QMs aligned to business domains."
                ),
                "evidence": {"degree": degree},
                "confidence": 0.88,
            })
    return findings


def _check_cycles(G) -> list[dict[str, Any]]:
    findings = []
    cycles = detect_cycles(G)

    meaningful_cycles = [c for c in cycles if len(c) >= 3]

    for cycle in meaningful_cycles[:5]:
        cycle_str = " → ".join(cycle[:6]) + (" → ..." if len(cycle) > 6 else "")
        findings.append({
            "id": _next_id(),
            "type": "TOPOLOGY_CYCLE",
            "category": "Structural Risk",
            "severity": "high",
            "subject_type": "topology",
            "subject_id": cycle[0],
            "title": f"Directed cycle detected in topology ({len(cycle)} nodes)",
            "description": (
                f"A directed cycle exists in the topology graph involving {len(cycle)} nodes: "
                f"{cycle_str}. Cycles indicate ambiguous message routing and potential for "
                f"message loops or delivery unpredictability."
            ),
            "impact": (
                "Cycles in the topology graph create routing ambiguity, risk message looping, "
                "and significantly complicate migration planning and target-state validation."
            ),
            "recommendation": (
                f"Trace the path '{cycle_str}' and identify where the circular dependency originates. "
                f"Refactor the flow to be acyclic with clear directional intent."
            ),
            "evidence": {
                "cycle_nodes": cycle[:10],
                "cycle_length": len(cycle),
            },
            "confidence": 0.95,
        })
    return findings


def _check_unknown_references(topology: dict[str, Any]) -> list[dict[str, Any]]:
    findings = []
    known_qms = {qm.get("qm_name") for qm in topology.get("queue_managers", []) if qm.get("qm_name")}
    known_apps = {a.get("app_id") for a in topology.get("applications", []) if a.get("app_id")}

    missing_qm_refs: set[str] = set()
    for q in topology.get("queues", []):
        owning = q.get("owning_qm")
        if owning and known_qms and owning not in known_qms:
            missing_qm_refs.add(owning)

    for ref in missing_qm_refs:
        orphaned_queues = [
            q.get("queue_name")
            for q in topology.get("queues", [])
            if q.get("owning_qm") == ref
        ]
        findings.append({
            "id": _next_id(),
            "type": "UNRESOLVED_QM_REFERENCE",
            "category": "Data Quality",
            "severity": "high",
            "subject_type": "queue_manager",
            "subject_id": ref,
            "title": f"Queues reference undeclared Queue Manager '{ref}'",
            "description": (
                f"{len(orphaned_queues)} queue(s) reference Queue Manager '{ref}', "
                f"which does not appear in the queue managers dataset."
            ),
            "impact": (
                "Unresolved QM references prevent accurate topology graph construction and "
                "will cause mapping errors during target-state assignment."
            ),
            "recommendation": (
                f"Add '{ref}' to the queue managers dataset or correct the owning_qm field "
                f"on the affected queues."
            ),
            "evidence": {
                "missing_qm": ref,
                "affected_queues": orphaned_queues[:5],
                "total_affected": len(orphaned_queues),
            },
            "confidence": 1.0,
        })

    missing_app_refs: set[str] = set()
    for rel in topology.get("relationships", []):
        for field in ("producer_app", "consumer_app"):
            app = rel.get(field)
            if app and known_apps and app not in known_apps:
                missing_app_refs.add(app)

    for app in missing_app_refs:
        findings.append({
            "id": _next_id(),
            "type": "UNRESOLVED_APP_REFERENCE",
            "category": "Data Quality",
            "severity": "high",
            "subject_type": "application",
            "subject_id": app,
            "title": f"Relationship references undeclared application '{app}'",
            "description": (
                f"One or more message flow relationships reference application '{app}', "
                f"which does not appear in the applications dataset."
            ),
            "impact": (
                "Missing application declarations make it impossible to correctly model "
                "producer/consumer topology and assign applications to target QMs."
            ),
            "recommendation": (
                f"Add '{app}' to the applications dataset with its owning QM and role, "
                f"or correct the application name in the relationships dataset."
            ),
            "evidence": {"missing_app": app},
            "confidence": 1.0,
        })

    missing_ch_refs: set[str] = set()
    for ch in topology.get("channels", []):
        for field in ("from_qm", "to_qm"):
            qm = ch.get(field)
            if qm and known_qms and qm not in known_qms:
                missing_ch_refs.add(qm)

    for ref in missing_ch_refs:
        findings.append({
            "id": _next_id(),
            "type": "UNRESOLVED_CHANNEL_QM_REFERENCE",
            "category": "Data Quality",
            "severity": "medium",
            "subject_type": "queue_manager",
            "subject_id": ref,
            "title": f"Channel endpoint references undeclared Queue Manager '{ref}'",
            "description": (
                f"One or more channels specify '{ref}' as an endpoint (from_qm or to_qm) "
                f"but this QM is not declared in the queue managers dataset."
            ),
            "impact": (
                "Unresolvable channel endpoints create topology graph gaps that affect "
                "routing analysis and transformation path calculations."
            ),
            "recommendation": (
                f"Declare '{ref}' in the queue managers dataset or correct the channel endpoint reference."
            ),
            "evidence": {"missing_qm": ref},
            "confidence": 1.0,
        })
    return findings


def _check_policy_drift(G, topology: dict[str, Any]) -> list[dict[str, Any]]:
    findings = []

    apps_without_qm: list[str] = []
    for app in topology.get("applications", []):
        app_id = app.get("app_id")
        if not app_id:
            continue
        connected_qm = app.get("connected_qm")
        if not connected_qm:
            inferred_qms = [
                n for n in G.successors(app_id)
                if G.nodes[n].get("node_type") == NODE_TYPE_QM
            ]
            if not inferred_qms:
                apps_without_qm.append(app_id)

    if apps_without_qm:
        for app_id in apps_without_qm:
            findings.append({
                "id": _next_id(),
                "type": "APP_WITHOUT_QM_ASSIGNMENT",
                "category": "Governance Drift",
                "severity": "medium",
                "subject_type": "application",
                "subject_id": app_id,
                "title": f"Application '{app_id}' has no Queue Manager assignment",
                "description": (
                    f"Application '{app_id}' is registered in the topology but is not connected "
                    f"to any Queue Manager — either directly via connected_qm or through "
                    f"inferred channel/relationship paths."
                ),
                "impact": (
                    "Applications without QM assignments cannot be mapped to target-state domains. "
                    "They will require manual intervention during transformation planning."
                ),
                "recommendation": (
                    f"Assign '{app_id}' to its primary owning Queue Manager in the applications "
                    f"dataset. This is required for accurate target-state domain allocation."
                ),
                "evidence": {"app_id": app_id},
                "confidence": 0.85,
            })

    qm_app_counts: dict[str, int] = {}
    for app in topology.get("applications", []):
        qm = app.get("connected_qm")
        if qm:
            qm_app_counts[qm] = qm_app_counts.get(qm, 0) + 1

    total_apps = len(topology.get("applications", []))
    if total_apps > 0:
        max_apps_on_qm = max(qm_app_counts.values()) if qm_app_counts else 0
        concentration_ratio = max_apps_on_qm / total_apps if total_apps > 0 else 0
        if concentration_ratio > 0.6 and max_apps_on_qm > 3:
            concentrated_qm = max(qm_app_counts, key=lambda k: qm_app_counts[k])
            findings.append({
                "id": _next_id(),
                "type": "APPLICATION_CONCENTRATION",
                "category": "Governance Drift",
                "severity": "medium",
                "subject_type": "queue_manager",
                "subject_id": concentrated_qm,
                "title": (
                    f"'{concentrated_qm}' hosts {max_apps_on_qm} of {total_apps} applications "
                    f"({concentration_ratio:.0%} concentration)"
                ),
                "description": (
                    f"Queue Manager '{concentrated_qm}' hosts {max_apps_on_qm} applications — "
                    f"{concentration_ratio:.0%} of the total application estate. "
                    f"This level of concentration contradicts domain-aligned target architecture."
                ),
                "impact": (
                    "High application concentration on a single QM creates a migration bottleneck, "
                    "limits parallel transformation, and increases blast radius on QM failure."
                ),
                "recommendation": (
                    f"Distribute applications from '{concentrated_qm}' across domain-aligned QMs "
                    f"as part of the target-state topology design."
                ),
                "evidence": {
                    "qm_name": concentrated_qm,
                    "hosted_apps": max_apps_on_qm,
                    "total_apps": total_apps,
                    "concentration_ratio": round(concentration_ratio, 3),
                },
                "confidence": 0.87,
            })
    return findings


def _check_single_points_of_failure(G) -> list[dict[str, Any]]:
    findings = []
    centrality = get_centrality_scores(G)

    high_centrality = {
        node: score
        for node, score in centrality.items()
        if score >= _CENTRALITY_HOTSPOT_THRESHOLD
    }

    for node, score in sorted(high_centrality.items(), key=lambda x: x[1], reverse=True)[:5]:
        node_type = G.nodes[node].get("node_type", "unknown")
        severity = "critical" if score >= 0.35 else "high"
        findings.append({
            "id": _next_id(),
            "type": "HIGH_CENTRALITY_NODE",
            "category": "Operational Risk",
            "severity": severity,
            "subject_type": node_type,
            "subject_id": node,
            "title": f"High-centrality node '{node}' (centrality={score:.3f})",
            "description": (
                f"'{node}' has a betweenness centrality score of {score:.3f}, placing it among "
                f"the most critical routing nodes in the topology. A large fraction of inter-node "
                f"paths pass through it."
            ),
            "impact": (
                "High-centrality nodes represent operational concentration risk. Failure or "
                "misconfiguration propagates broadly across dependent flows."
            ),
            "recommendation": (
                f"Review whether '{node}' can be replicated, federated, or have its centrality "
                f"reduced by adding direct connections between its downstream dependents."
            ),
            "evidence": {
                "centrality_score": round(score, 4),
                "node_type": node_type,
            },
            "confidence": 0.82,
        })
    return findings


def _extract_hotspots(findings: list[dict[str, Any]], G) -> list[dict[str, Any]]:
    subject_finding_counts: dict[str, list[dict[str, Any]]] = {}
    for f in findings:
        sid = f.get("subject_id", "")
        subject_finding_counts.setdefault(sid, []).append(f)

    hotspot_types = {"MULTI_QM_APPLICATION", "QM_OVERLOAD_HOTSPOT", "APP_FAN_OUT_HOTSPOT",
                     "HIGH_CENTRALITY_NODE", "REDUNDANT_CHANNELS", "TOPOLOGY_CYCLE",
                     "APPLICATION_CONCENTRATION", "UNRESOLVED_QM_REFERENCE"}

    hotspot_candidates = {}
    for f in findings:
        if f.get("type") in hotspot_types:
            sid = f.get("subject_id", "")
            if sid not in hotspot_candidates:
                hotspot_candidates[sid] = {
                    "object_id": sid,
                    "object_type": f.get("subject_type", "unknown"),
                    "reason": f.get("title", ""),
                    "severity": f.get("severity", "low"),
                    "score": f.get("confidence", 0.5),
                    "finding_count": 0,
                    "details": f.get("evidence", {}),
                }
            hotspot_candidates[sid]["finding_count"] = len(subject_finding_counts.get(sid, []))
            current = hotspot_candidates[sid]["severity"]
            incoming = f.get("severity", "low")
            if severity_rank(incoming) > severity_rank(current):
                hotspot_candidates[sid]["severity"] = incoming

    ranked = sorted(
        hotspot_candidates.values(),
        key=lambda h: (severity_rank(h["severity"]), h["finding_count"]),
        reverse=True,
    )
    return ranked[:10]
