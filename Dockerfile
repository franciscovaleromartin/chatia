# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build && ls -la dist/

# Setup backend
FROM python:3.10-slim

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Frontend Build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Verify frontend files were copied
RUN ls -la ./frontend/dist/ && test -f ./frontend/dist/index.html || (echo "ERROR: Frontend build files not found!" && exit 1)

# Install Backend Deps
COPY backend/requirements.txt ./backend/
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend/ .

# Expose port (Render uses PORT env var)
EXPOSE 5000

# Run - Use PORT env var if available, otherwise default to 5000
CMD gunicorn --worker-class eventlet -w 1 app:app --bind 0.0.0.0:${PORT:-5000}
