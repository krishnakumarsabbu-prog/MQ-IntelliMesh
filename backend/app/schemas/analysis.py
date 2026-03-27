from pydantic import BaseModel
from typing import Optional, Any


class AnalysisFinding(BaseModel):
    id: str
    type: str
    category: str
    severity: str
    subject_type: str
    subject_id: str
    title: str
    description: str
    impact: str
    recommendation: str
    evidence: dict[str, Any] = {}
    confidence: float = 1.0


class SeverityBreakdown(BaseModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0


class AnalysisSummary(BaseModel):
    total_findings: int = 0
    severity_breakdown: SeverityBreakdown = SeverityBreakdown()
    category_breakdown: dict[str, int] = {}
    policy_violations: int = 0
    hotspots: int = 0
    simplification_opportunities: int = 0
    critical_and_high: int = 0


class HotspotItem(BaseModel):
    object_id: str
    object_type: str
    reason: str
    severity: str
    score: float
    finding_count: int
    details: dict[str, Any] = {}


class HealthScore(BaseModel):
    score: int
    label: str
    contributing_factors: list[str] = []


class TopologyStats(BaseModel):
    queue_managers: int = 0
    queues: int = 0
    applications: int = 0
    channels: int = 0
    relationships: int = 0


class AnalyzeResponse(BaseModel):
    status: str
    message: str
    dataset_id: str
    summary: AnalysisSummary = AnalysisSummary()
    health: HealthScore = HealthScore(score=0, label="Unknown")
    hotspots: list[HotspotItem] = []
    findings: list[AnalysisFinding] = []
    topology_stats: TopologyStats = TopologyStats()


class AnalysisRequest(BaseModel):
    dataset_id: Optional[str] = None


class FindingSummary(BaseModel):
    finding_id: str
    category: str
    severity: str
    title: str
    affected_objects: list[str] = []
    description: str


class AnalysisResponse(BaseModel):
    message: str
    status: str
    dataset_id: Optional[str] = None
    total_findings: int = 0
    critical: int = 0
    warnings: int = 0
    info: int = 0
    findings: list[FindingSummary] = []
    next_phase: Optional[str] = None
