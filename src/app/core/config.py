from typing import Any, List, Union
from pydantic import AnyHttpUrl, BeforeValidator, Field, field_validator, ValidationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Annotated

def parse_cors(v: Any) -> List[str]:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list):
        return v
    return []

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    PROJECT_NAME: str = "SaaS Backend Application"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520  # 8 days
    ALGORITHM: str = "HS256"

    # Database Configuration
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str | None = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Any, info: ValidationInfo) -> Any:
        if isinstance(v, str) and v:
            return v
        user = info.data.get("POSTGRES_USER")
        password = info.data.get("POSTGRES_PASSWORD")
        server = info.data.get("POSTGRES_SERVER")
        port = info.data.get("POSTGRES_PORT", 5432)
        db = info.data.get("POSTGRES_DB")
        return f"postgresql+asyncpg://{user}:{password}@{server}:{port}/{db}"

    # Redis Configuration
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL: str | None = None

    @field_validator("REDIS_URL", mode="before")
    @classmethod
    def assemble_redis_connection(cls, v: Any, info: ValidationInfo) -> Any:
        if isinstance(v, str) and v:
            return v
        host = info.data.get("REDIS_HOST", "redis")
        port = info.data.get("REDIS_PORT", 6379)
        db = info.data.get("REDIS_DB", 0)
        return f"redis://{host}:{port}/{db}"

    # Celery Configuration
    CELERY_BROKER_URL: str | None = None
    CELERY_RESULT_BACKEND: str | None = None

    @field_validator("CELERY_BROKER_URL", mode="before")
    @classmethod
    def assemble_celery_broker(cls, v: Any, info: ValidationInfo) -> Any:
        if isinstance(v, str) and v:
            return v
        redis_url = info.data.get("REDIS_URL")
        if not redis_url:
            host = info.data.get("REDIS_HOST", "redis")
            port = info.data.get("REDIS_PORT", 6379)
            db = info.data.get("REDIS_DB", 0)
            redis_url = f"redis://{host}:{port}/{db}"
        return redis_url

    @field_validator("CELERY_RESULT_BACKEND", mode="before")
    @classmethod
    def assemble_celery_backend(cls, v: Any, info: ValidationInfo) -> Any:
        if isinstance(v, str) and v:
            return v
        redis_url = info.data.get("REDIS_URL")
        if not redis_url:
            host = info.data.get("REDIS_HOST", "redis")
            port = info.data.get("REDIS_PORT", 6379)
            db = info.data.get("REDIS_DB", 0)
            redis_url = f"redis://{host}:{port}/{db}"
        return redis_url

    # CORS Configuration
    BACKEND_CORS_ORIGINS: Annotated[
        List[str],
        BeforeValidator(parse_cors),
    ] = []

    # First Superuser account configuration
    FIRST_SUPERUSER_EMAIL: str
    FIRST_SUPERUSER_PASSWORD: str

# Create settings singleton instance
settings = Settings()
