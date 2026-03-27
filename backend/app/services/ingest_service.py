from app.core.logging import get_logger

logger = get_logger(__name__)


def ingest_csv(file_path: str, dataset_name: str | None = None) -> dict:
    """
    Phase 7B: Read and parse a CSV topology dataset.
    - Validate required columns
    - Parse rows into domain objects
    - Store parsed topology in memory / session store
    - Return a TopologyDatasetSummary
    TODO: implement CSV parsing with pandas
    TODO: validate expected columns (QM_NAME, OBJECT_TYPE, OBJECT_NAME, ...)
    TODO: map raw rows to domain models (QueueManager, Queue, Channel, Application)
    TODO: build an in-memory topology registry keyed by dataset_id
    """
    logger.info("ingest_csv called — placeholder, dataset_name=%s", dataset_name)
    return {
        "message": "Ingestion endpoint ready",
        "status": "placeholder",
        "next_phase": "CSV parsing and validation",
    }


def get_dataset_summary(dataset_id: str) -> dict:
    """
    Phase 7B: Retrieve a previously ingested dataset summary by ID.
    TODO: look up in-memory topology registry
    TODO: return TopologyDatasetSummary
    """
    logger.info("get_dataset_summary called — placeholder, dataset_id=%s", dataset_id)
    return {}
