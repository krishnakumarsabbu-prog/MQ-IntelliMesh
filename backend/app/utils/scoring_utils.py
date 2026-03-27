from typing import Any

_SEVERITY_WEIGHTS = {
    "critical": 20,
    "high": 10,
    "medium": 4,
    "low": 1,
}

_CATEGORY_SIMPLIFICATION = {
    "Topology Waste",
    "Simplification Opportunity",
}

_CATEGORY_POLICY = {
    "Policy Violation",
    "Governance Drift",
}


def compute_health_score(
    findings: list[dict[str, Any]],
    topology: dict[str, list[dict[str, Any]]],
) -> dict[str, Any]:
    total_penalty = 0
    factors: list[str] = []

    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in findings:
        sev = f.get("severity", "low")
        if sev in severity_counts:
            severity_counts[sev] += 1
        total_penalty += _SEVERITY_WEIGHTS.get(sev, 0)

    if severity_counts["critical"] > 0:
        factors.append(f"{severity_counts['critical']} critical finding(s) detected")
    if severity_counts["high"] > 0:
        factors.append(f"{severity_counts['high']} high-severity finding(s) detected")

    qm_count = len(topology.get("queue_managers", []))
    queue_count = len(topology.get("queues", []))
    app_count = len(topology.get("applications", []))
    ch_count = len(topology.get("channels", []))

    if qm_count > 0:
        queue_per_qm = queue_count / qm_count
        if queue_per_qm > 30:
            total_penalty += 8
            factors.append(f"High queue density: {queue_per_qm:.0f} queues per QM on average")
        if ch_count > qm_count * 4:
            total_penalty += 6
            factors.append(f"Channel proliferation: {ch_count} channels for {qm_count} QMs")

    if app_count > 0 and qm_count > 0:
        qm_per_app_ratio = qm_count / app_count
        if qm_per_app_ratio > 1.5:
            total_penalty += 5
            factors.append(f"Disproportionate QM-to-app ratio ({qm_count} QMs / {app_count} apps)")

    raw_score = max(0, 100 - total_penalty)

    if raw_score >= 80:
        label = "Healthy"
    elif raw_score >= 60:
        label = "Moderate Risk"
    elif raw_score >= 35:
        label = "High Risk"
    else:
        label = "Critical Complexity"

    if not factors:
        factors.append("No major structural issues detected in current topology")

    return {
        "score": raw_score,
        "label": label,
        "contributing_factors": factors,
    }


def severity_rank(severity: str) -> int:
    return {"critical": 4, "high": 3, "medium": 2, "low": 1}.get(severity, 0)


def count_by_severity(findings: list[dict[str, Any]]) -> dict[str, int]:
    counts: dict[str, int] = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in findings:
        sev = f.get("severity", "low")
        if sev in counts:
            counts[sev] += 1
    return counts


def count_by_category(findings: list[dict[str, Any]]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for f in findings:
        cat = f.get("category", "Unknown")
        counts[cat] = counts.get(cat, 0) + 1
    return counts


def count_policy_violations(findings: list[dict[str, Any]]) -> int:
    return sum(1 for f in findings if f.get("category") in _CATEGORY_POLICY)


def count_simplification_opportunities(findings: list[dict[str, Any]]) -> int:
    return sum(1 for f in findings if f.get("category") in _CATEGORY_SIMPLIFICATION)
