from fastapi import APIRouter
from app.schemas.common import HealthResponse, VersionResponse, RootResponse
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=RootResponse, tags=["Health"])
def root():
    return RootResponse(
        name=settings.app_name,
        status="running",
        version=settings.app_version,
    )


@router.get("/health", response_model=HealthResponse, tags=["Health"])
def health():
    return HealthResponse(
        status="healthy",
        service="mq-intellimesh-backend",
    )


@router.get("/version", response_model=VersionResponse, tags=["Health"])
def version():
    return VersionResponse(
        version=settings.app_version,
        environment=settings.environment,
    )
