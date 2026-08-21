from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from src.app.core.config import settings

# Create async engine with production-ready connection pool settings
# 1. pool_size: number of persistent connections to keep open
# 2. max_overflow: max number of temporary connections allowed beyond pool_size
# 3. pool_recycle: close/recreate connection after 30 minutes to prevent stale sockets
# 4. pool_pre_ping: test database connection liveness on checkout
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True only for verbose query logging in dev
    pool_size=20,
    max_overflow=10,
    pool_recycle=1800,
    pool_pre_ping=True,
    pool_timeout=30,
)

# Configure the async session factory
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Async dependency for FastAPI endpoint DB session injection
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
