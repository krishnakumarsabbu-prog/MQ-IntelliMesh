from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.constants import API_PREFIX
from app.core.logging import get_logger
from app.utils.file_utils import ensure_data_directories
from app.api import routes_health, routes_ingest, routes_analysis
from app.api import routes_transform, routes_complexity, routes_explain, routes_export

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s v%s [%s]", settings.app_name, settings.app_version, settings.environment)
    ensure_data_directories()
    logger.info("Data directories verified.")
    yield
    logger.info("Shutting down %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Intelligence engine for MQ topology analysis, transformation, and export.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_health.router)
app.include_router(routes_ingest.router, prefix=API_PREFIX)
app.include_router(routes_analysis.router, prefix=API_PREFIX)
app.include_router(routes_transform.router, prefix=API_PREFIX)
app.include_router(routes_complexity.router, prefix=API_PREFIX)
app.include_router(routes_explain.router, prefix=API_PREFIX)
app.include_router(routes_export.router, prefix=API_PREFIX)
