from pydantic import BaseModel
from typing import Optional, Any


class TransformRequest(BaseModel):
    dataset_id: Optional[str] = None


class TransformationDecision(BaseModel):
    id: str
    decision_type: str
    subject_type: str
    subject_id: str
    title: str
    description: str
    reason: str
    impact: str
    confidence: float = 1.0
    evidence: dict[str, Any] = {}


class TargetQueueManager(BaseModel):
    qm_name: str
    qm_type: str = "DEDICATED"
    region: Optional[str] = None
    environment: Optional[str] = None
    owning_apps: list[str] = []


class TargetApplication(BaseModel):
    app_id: str
    owning_qm: str
    role: str = "both"
    assignment_reason: str = ""


class TargetLocalQueue(BaseModel):
    queue_name: str
    owning_qm: str
    for_app: str
    queue_type: str = "LOCAL"


class TargetRemoteQueue(BaseModel):
    queue_name: str
    owning_qm: str
    remote_qm: str
    xmit_queue: str
    resolves_to_local: str


class TargetXmitQueue(BaseModel):
    queue_name: str
    owning_qm: str
    target_qm: str
    queue_type: str = "LOCAL"


class TargetChannel(BaseModel):
    channel_name: str
    channel_type: str
    from_qm: str
    to_qm: str
    xmit_queue: Optional[str] = None


class TargetRoute(BaseModel):
    route_id: str
    producer_app: str
    consumer_app: str
    original_queue: str
    producer_qm: str
    consumer_qm: str
    remote_queue: str
    xmit_queue: str
    sender_channel: str
    receiver_channel: str
    local_queue: str
    same_qm: bool = False


class TargetTopology(BaseModel):
    queue_managers: list[TargetQueueManager] = []
    applications: list[TargetApplication] = []
    local_queues: list[TargetLocalQueue] = []
    remote_queues: list[TargetRemoteQueue] = []
    xmit_queues: list[TargetXmitQueue] = []
    channels: list[TargetChannel] = []
    routes: list[TargetRoute] = []


class ValidationCheck(BaseModel):
    check_id: str
    name: str
    passed: bool
    detail: str = ""


class ValidationResult(BaseModel):
    compliance_score: float = 100.0
    passed_checks: list[ValidationCheck] = []
    failed_checks: list[ValidationCheck] = []
    warnings: list[str] = []
    total_checks: int = 0


class ComplexityDimension(BaseModel):
    name: str
    label: str
    value: float
    weight: float
    weighted_score: float


class ComplexityBreakdown(BaseModel):
    total_score: float
    dimensions: list[ComplexityDimension] = []
    queue_manager_count: int = 0
    channel_count: int = 0
    avg_routing_hops: float = 0.0
    multi_qm_violations: int = 0
    orphan_objects: int = 0
    hotspot_penalty: float = 0.0
    structural_density: float = 0.0


class ComplexityComparison(BaseModel):
    before: ComplexityBreakdown = ComplexityBreakdown(total_score=0)
    after: ComplexityBreakdown = ComplexityBreakdown(total_score=0)
    reduction_percent: float = 0.0
    delta_score: float = 0.0


class TransformSummary(BaseModel):
    applications: int = 0
    queue_managers_before: int = 0
    queue_managers_after: int = 0
    channels_before: int = 0
    channels_after: int = 0
    violations_eliminated: int = 0
    avg_hops_before: float = 0.0
    avg_hops_after: float = 1.0
    local_queues_generated: int = 0
    remote_queues_generated: int = 0
    xmit_queues_generated: int = 0
    routes_generated: int = 0
    decisions_made: int = 0


class TransformResponse(BaseModel):
    status: str
    message: str
    dataset_id: str
    transformation_id: str
    summary: TransformSummary = TransformSummary()
    target_topology: TargetTopology = TargetTopology()
    decisions: list[TransformationDecision] = []
    validation: ValidationResult = ValidationResult()
    complexity: ComplexityComparison = ComplexityComparison()


class TransformDecision(BaseModel):
    decision_id: str
    category: str
    subject: str
    change: str
    rationale: str
    confidence: float
    complexity_delta: int
    risk_delta: int
