# =============================================================================
# Frontend Docker Build — LeadPulse SaaS (for local Docker Compose only)
# In production, Vercel builds and serves the frontend automatically.
# =============================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Accept VITE_API_BASE_URL as a build-time argument.
# Vite bakes this into the JS bundle at build time — it is NOT a runtime env var.
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Production stage: serve built SPA via nginx
# ---------------------------------------------------------------------------
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
