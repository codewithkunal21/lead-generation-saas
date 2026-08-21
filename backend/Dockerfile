FROM mcr.microsoft.com/playwright/python:v1.44.0-jammy

WORKDIR /app

# Ensure Python output is unbuffered and PYTHONPATH is correct
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install curl (used by Docker Compose health check) and clean up apt cache
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (leverages Docker layer cache)
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Install Playwright Chromium browser binaries (already provided by the base
# image, but run install as a safety step to ensure correct version)
RUN playwright install chromium --with-deps 2>/dev/null || true

# Copy application source
COPY . .

# Ensure the startup script is executable
RUN chmod +x start.sh

# Expose the default port (Render / Railway / Fly.io override via $PORT)
EXPOSE 8000

# Use start.sh which runs migrations then starts uvicorn
CMD ["sh", "start.sh"]