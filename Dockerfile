# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN echo "=== Installing dependencies ===" && \
    npm ci && \
    echo "=== Dependencies installed ==="

# Copy all frontend source files
COPY frontend/ ./

# Verify source files are present
RUN echo "=== Checking source files ===" && \
    ls -la && \
    test -f index.html || (echo "ERROR: index.html missing!" && exit 1) && \
    test -d src || (echo "ERROR: src directory missing!" && exit 1) && \
    echo "=== Source files OK ==="

# Build and verify
RUN echo "=== Starting frontend build ===" && \
    npm run build && \
    echo "=== Build complete, checking dist directory ===" && \
    ls -la dist/ && \
    test -f dist/index.html || (echo "ERROR: dist/index.html not created!" && exit 1) && \
    echo "=== Frontend build successful ==="

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
