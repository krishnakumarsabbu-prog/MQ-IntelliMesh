from pydantic import BaseModel
from typing import Optional, Any


class FileIngestResult(BaseModel):
    filename: str
    dataset_type: str
    row_count: int
    columns_detected: list[str] = []
    columns_normalized: list[str] = []
    errors: list[str] = []
    warnings: list[str] = []


class InventoryCounts(BaseModel):
    queue_managers: int = 0
    queues: int = 0
    applications: int = 0
    channels: int = 0
    relationships: int = 0
    metadata: int = 0


class GraphStats(BaseModel):
    nodes: int = 0
    edges: int = 0
    node_types: dict[str, int] = {}
    edge_types: dict[str, int] = {}
    connected_components: Optional[int] = None
    density: Optional[float] = None


class IngestPreview(BaseModel):
    queue_managers: list[dict[str, Any]] = []
    queues: list[dict[str, Any]] = []
    applications: list[dict[str, Any]] = []
    channels: list[dict[str, Any]] = []
    relationships: list[dict[str, Any]] = []


class IngestResponse(BaseModel):
    status: str
    message: str
    dataset_id: str
    datasets_detected: list[str] = []
    files_processed: list[FileIngestResult] = []
    inventory: InventoryCounts = InventoryCounts()
    graph: GraphStats = GraphStats()
    warnings: list[str] = []
    errors: list[str] = []
    preview: IngestPreview = IngestPreview()
    normalization_notes: list[str] = []
    source_format: Optional[str] = None


class IngestValidationResult(BaseModel):
    valid: bool
    row_count: int
    column_count: int
    missing_required_columns: list[str] = []
    warnings: list[str] = []
