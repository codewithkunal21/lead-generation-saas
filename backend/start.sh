#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Waiting for database to be ready..."
until python -c "
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from src.app.core.config import settings

async def check():
    try:
        engine = create_async_engine(settings.DATABASE_URL)
        async with engine.connect() as conn:
            pass
        await engine.dispose()
        sys.exit(0)
    except Exception:
        sys.exit(1)

asyncio.run(check())
" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - running migrations"
alembic upgrade head

echo "Creating initial superuser..."
python src/app/create_superuser.py

echo "Starting application..."
exec uvicorn src.app.main:app --host 0.0.0.0 --port 8000 --reload
