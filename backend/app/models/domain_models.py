from pydantic import BaseModel, Field
from typing import Optional, Any
from enum import Enum


class QueueManagerType(str, Enum):
    DEDICATED = "DEDICATED"
    SHARED = "SHARED"
    HUB = "HUB"
    INTEGRATION = "INTEGRATION"
    UNKNOWN = "UNKNOWN"


class QueueType(str, Enum):
    LOCAL = "LOCAL"
    REMOTE = "REMOTE"
    ALIAS = "ALIAS"
    MODEL = "MODEL"
    CLUSTER = "CLUSTER"
    UNKNOWN = "UNKNOWN"


class ChannelType(str, Enum):
    SDR = "SDR"
    RCVR = "RCVR"
    SVRCONN = "SVRCONN"
    CLNTCONN = "CLNTCONN"
    XMIT = "XMIT"
    UNKNOWN = "UNKNOWN"


class ChannelStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    STOPPED = "STOPPED"
    RETRY = "RETRY"
    UNKNOWN = "UNKNOWN"


class DatasetType(str, Enum):
    QUEUE_MANAGERS = "queue_managers"
    QUEUES = "queues"
    APPLICATIONS = "applications"
    CHANNELS = "channels"
    RELATIONSHIPS = "relationships"
    METADATA = "metadata"
    UNKNOWN = "unknown"


class Application(BaseModel):
    app_id: str
    connected_qm: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    owning_team: Optional[str] = None
    compliance_tags: list[str] = Field(default_factory=list)
    message_volume_daily: Optional[int] = None
    raw: dict[str, Any] = Field(default_factory=dict)


class Queue(BaseModel):
    queue_name: str
    queue_type: str = "UNKNOWN"
    owning_qm: str
    depth: Optional[int] = None
    max_depth: Optional[int] = None
    persistence: Optional[str] = None
    get_enabled: Optional[str] = None
    put_enabled: Optional[str] = None
    description: Optional[str] = None
    is_dlq: bool = False
    remote_qm: Optional[str] = None
    raw: dict[str, Any] = Field(default_factory=dict)


class Channel(BaseModel):
    channel_name: str
    channel_type: str = "UNKNOWN"
    from_qm: str
    to_qm: Optional[str] = None
    connection_name: Optional[str] = None
    transmission_queue: Optional[str] = None
    status: str = "UNKNOWN"
    ssl_cipher: Optional[str] = None
    description: Optional[str] = None
    raw: dict[str, Any] = Field(default_factory=dict)


class QueueManager(BaseModel):
    qm_name: str
    qm_type: str = "UNKNOWN"
    region: Optional[str] = None
    neighborhood: Optional[str] = None
    environment: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    platform: Optional[str] = None
    version: Optional[str] = None
    has_dlq: bool = False
    dlq_name: Optional[str] = None
    raw: dict[str, Any] = Field(default_factory=dict)


class ProducerConsumerRelation(BaseModel):
    producer_app: str
    consumer_app: str
    queue_name: Optional[str] = None
    queue_manager: Optional[str] = None
    message_type: Optional[str] = None
    avg_msg_size_kb: Optional[float] = None
    daily_volume: Optional[int] = None
    raw: dict[str, Any] = Field(default_factory=dict)


class MetadataEntry(BaseModel):
    region: Optional[str] = None
    neighborhood: Optional[str] = None
    environment: Optional[str] = None
    raw: dict[str, Any] = Field(default_factory=dict)


class CanonicalTopologyModel(BaseModel):
    dataset_id: str
    queue_managers: list[QueueManager] = Field(default_factory=list)
    queues: list[Queue] = Field(default_factory=list)
    applications: list[Application] = Field(default_factory=list)
    channels: list[Channel] = Field(default_factory=list)
    relationships: list[ProducerConsumerRelation] = Field(default_factory=list)
    metadata: list[MetadataEntry] = Field(default_factory=list)


class IngestionWarning(BaseModel):
    code: str
    message: str
    dataset_type: Optional[str] = None
    affected_record: Optional[str] = None


class IngestionError(BaseModel):
    code: str
    message: str
    dataset_type: Optional[str] = None
    filename: Optional[str] = None


class GraphSummary(BaseModel):
    nodes: int = 0
    edges: int = 0
    node_types: dict[str, int] = Field(default_factory=dict)
    edge_types: dict[str, int] = Field(default_factory=dict)
    connected_components: Optional[int] = None
    density: Optional[float] = None


class TopologyDatasetSummary(BaseModel):
    dataset_id: str
    dataset_name: Optional[str] = None
    source_files: list[str] = Field(default_factory=list)
    total_applications: int = 0
    total_queue_managers: int = 0
    total_queues: int = 0
    total_channels: int = 0
    total_relations: int = 0
    ingested_at: Optional[str] = None
    status: str = "pending"
