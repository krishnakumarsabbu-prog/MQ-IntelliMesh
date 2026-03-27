from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MQ IntelliMesh Intelligence Engine"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
