#!/bin/sh
# LeadPulse backend startup script — runs in production container
# Executes: DB wait → migrations → superuser creation → uvicorn

set -e

# Determine port — Render/Railway/Fly.io inject $PORT; default 8000
PORT="${PORT:-8000}"

echo "=== LeadPulse Backend Starting ==="
echo "Port: $PORT"
echo "Environment: ${ENVIRONMENT:-development}"

# ---------------------------------------------------------------------------
# 1. Wait for PostgreSQL to be ready
# ---------------------------------------------------------------------------
echo "Waiting for PostgreSQL to be ready..."
until python -c "
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from src.app.core.config import settings

async def check():
    try:
        engine = create_async_engine(settings.DATABASE_URL, echo=False)
        async with engine.connect() as conn:
            pass
        await engine.dispose()
        sys.exit(0)
    except Exception as e:
        print(f'  DB not ready: {e}', file=sys.stderr)
        sys.exit(1)

asyncio.run(check())
" 2>/dev/null; do
    echo "  PostgreSQL is unavailable — retrying in 2s..."
    sleep 2
done

echo "PostgreSQL is ready."

# ---------------------------------------------------------------------------
# 2. Run Alembic migrations
# ---------------------------------------------------------------------------
echo "Running Alembic migrations..."
alembic upgrade head
echo "Migrations complete."

# ---------------------------------------------------------------------------
# 3. Create initial superuser (idempotent — skips if already exists)
# ---------------------------------------------------------------------------
echo "Ensuring initial superuser exists..."
python src/app/create_superuser.py
echo "Superuser check complete."

# ---------------------------------------------------------------------------
# 4. Start the FastAPI application
#    - NO --reload (production)
#    - workers=1 for async; use gunicorn with uvicorn workers for multi-core
# ---------------------------------------------------------------------------
echo "Starting uvicorn on 0.0.0.0:${PORT}..."
exec uvicorn src.app.main:app \
    --host 0.0.0.0 \
    --port "${PORT}" \
    --workers 1 \
    --log-level info \
    --access-log
