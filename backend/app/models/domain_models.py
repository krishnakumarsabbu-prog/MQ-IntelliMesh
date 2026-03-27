from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class QueueManagerType(str, Enum):
    DEDICATED = "DEDICATED"
    SHARED = "SHARED"
    HUB = "HUB"
    INTEGRATION = "INTEGRATION"


class QueueType(str, Enum):
    LOCAL = "LOCAL"
    REMOTE = "REMOTE"
    ALIAS = "ALIAS"
    MODEL = "MODEL"
    CLUSTER = "CLUSTER"


class ChannelType(str, Enum):
    SDR = "SDR"
    RCVR = "RCVR"
    SVRCONN = "SVRCONN"
    CLNTCONN = "CLNTCONN"
    XMIT = "XMIT"


class ChannelStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    STOPPED = "STOPPED"
    RETRY = "RETRY"


class Application(BaseModel):
    name: str
    description: Optional[str] = None
    owning_team: Optional[str] = None
    primary_qm: Optional[str] = None
    compliance_tags: list[str] = Field(default_factory=list)
    message_volume_daily: Optional[int] = None


class Queue(BaseModel):
    name: str
    queue_type: QueueType
    queue_manager: str
    max_depth: Optional[int] = None
    current_depth: Optional[int] = None
    persistence: bool = True
    get_enabled: bool = True
    put_enabled: bool = True
    description: Optional[str] = None
    is_dlq: bool = False
    remote_qm: Optional[str] = None


class Channel(BaseModel):
    name: str
    channel_type: ChannelType
    queue_manager: str
    connection_name: Optional[str] = None
    transmission_queue: Optional[str] = None
    status: ChannelStatus = ChannelStatus.ACTIVE
    ssl_cipher: Optional[str] = None
    max_instances: Optional[int] = None
    description: Optional[str] = None


class QueueManager(BaseModel):
    name: str
    qm_type: QueueManagerType = QueueManagerType.SHARED
    host: Optional[str] = None
    port: Optional[int] = None
    platform: Optional[str] = None
    version: Optional[str] = None
    channel_count: int = 0
    queue_count: int = 0
    has_dlq: bool = False
    dlq_name: Optional[str] = None
    applications: list[str] = Field(default_factory=list)
    queues: list[Queue] = Field(default_factory=list)
    channels: list[Channel] = Field(default_factory=list)


class ProducerConsumerRelation(BaseModel):
    producer_app: str
    consumer_app: str
    queue_name: str
    queue_manager: str
    message_type: Optional[str] = None
    avg_msg_size_kb: Optional[float] = None
    daily_volume: Optional[int] = None


class TopologyDatasetSummary(BaseModel):
    dataset_id: str
    dataset_name: Optional[str] = None
    source_filename: Optional[str] = None
    total_applications: int = 0
    total_queue_managers: int = 0
    total_queues: int = 0
    total_channels: int = 0
    total_relations: int = 0
    ingested_at: Optional[str] = None
    status: str = "pending"
