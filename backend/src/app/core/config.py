import json
from typing import Any, List
from pydantic import field_validator, ValidationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors(v: Any) -> List[str]:
    """Parse CORS origins from a JSON array string, comma-separated string, or list."""
    if isinstance(v, str):
        v_str = v.strip()
        if not v_str:
            return []
        if v_str.startswith("[") and v_str.endswith("]"):
            try:
                parsed = json.loads(v_str)
                if isinstance(parsed, list):
                    return [str(i).strip().rstrip("/") for i in parsed if str(i).strip()]
            except Exception:
                pass
        return [i.strip().rstrip("/") for i in v_str.split(",") if i.strip()]
    elif isinstance(v, list):
        return [str(i).strip().rstrip("/") for i in v if str(i).strip()]
    return []


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ---------------------------------------------------------------------------
    # General
    # ---------------------------------------------------------------------------
    PROJECT_NAME: str = "LeadPulse SaaS Backend"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"  # development | production | testing

    # Port — overridden by Render/Railway/Fly.io via $PORT env var
    PORT: int = 8000

    # ---------------------------------------------------------------------------
    # Security
    # ---------------------------------------------------------------------------
    SECRET_KEY: str  # Required — generate with: openssl rand -hex 32
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520  # 8 days
    ALGORITHM: str = "HS256"

    # ---------------------------------------------------------------------------
    # Database
    # In production, set DATABASE_URL directly (e.g. managed Postgres on Render).
    # In local Docker Compose, component vars (POSTGRES_SERVER etc.) are used.
    # ---------------------------------------------------------------------------
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "saas_db"
    POSTGRES_PORT: int = 5432
    # Set DATABASE_URL directly to override all component vars above.
    # Must use postgresql+asyncpg:// scheme for async SQLAlchemy.
    DATABASE_URL: str | None = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Any, info: ValidationInfo) -> Any:
        if isinstance(v, str) and v.strip():
            # Ensure the URL uses the asyncpg driver
            url = v.strip()
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgres://"):
                # Render uses postgres:// — convert to asyncpg
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            return url
        user = info.data.get("POSTGRES_USER", "postgres")
        password = info.data.get("POSTGRES_PASSWORD", "postgres")
        server = info.data.get("POSTGRES_SERVER", "localhost")
        port = info.data.get("POSTGRES_PORT", 5432)
        db = info.data.get("POSTGRES_DB", "saas_db")
        return f"postgresql+asyncpg://{user}:{password}@{server}:{port}/{db}"

    # ---------------------------------------------------------------------------
    # Redis
    # In production, set REDIS_URL directly (e.g. managed Redis on Render/Railway).
    # In local Docker Compose, REDIS_HOST=redis is correct.
    # ---------------------------------------------------------------------------
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL: str | None = None

    @field_validator("REDIS_URL", mode="before")
    @classmethod
    def assemble_redis_connection(cls, v: Any, info: ValidationInfo) -> Any:
        if isinstance(v, str) and v.strip():
            return v.strip()
        host = info.data.get("REDIS_HOST", "localhost")
        port = info.data.get("REDIS_PORT", 6379)
        db = info.data.get("REDIS_DB", 0)
        return f"redis://{host}:{port}/{db}"

    # ---------------------------------------------------------------------------
    # Celery
    # ---------------------------------------------------------------------------
    CELERY_BROKER_URL: str | None = None
    CELERY_RESULT_BACKEND: str | None = None

    @field_validator("CELERY_BROKER_URL", mode="before")
    @classmethod
    def assemble_celery_broker(cls, v: Any, info: ValidationInfo) -> Any:
        if isinstance(v, str) and v.strip():
            return v.strip()
        # Fall back to REDIS_URL if already assembled
        redis_url = info.data.get("REDIS_URL")
        if redis_url:
            return redis_url
        host = info.data.get("REDIS_HOST", "localhost")
        port = info.data.get("REDIS_PORT", 6379)
        db = info.data.get("REDIS_DB", 0)
        return f"redis://{host}:{port}/{db}"

    @field_validator("CELERY_RESULT_BACKEND", mode="before")
    @classmethod
    def assemble_celery_backend(cls, v: Any, info: ValidationInfo) -> Any:
        if isinstance(v, str) and v.strip():
            return v.strip()
        redis_url = info.data.get("REDIS_URL")
        if redis_url:
            return redis_url
        host = info.data.get("REDIS_HOST", "localhost")
        port = info.data.get("REDIS_PORT", 6379)
        db = info.data.get("REDIS_DB", 0)
        return f"redis://{host}:{port}/{db}"

    # ---------------------------------------------------------------------------
    # CORS
    # Set BACKEND_CORS_ORIGINS to a comma-separated list or JSON array of
    # allowed frontend origins. Example for production:
    #   BACKEND_CORS_ORIGINS=https://lead-generation-saas-ixyh.vercel.app
    # localhost/127.0.0.1 origins are additionally allowed via regex in main.py.
    # ---------------------------------------------------------------------------
    BACKEND_CORS_ORIGINS: Any = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        return parse_cors(v)

    # ---------------------------------------------------------------------------
    # Initial Superuser (created idempotently on startup)
    # ---------------------------------------------------------------------------
    FIRST_SUPERUSER_EMAIL: str = "admin@example.com"
    FIRST_SUPERUSER_PASSWORD: str  # Required — never use a weak password in production


# Singleton settings instance loaded from environment / .env file
settings = Settings()
