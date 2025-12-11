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
RUN echo "=== Copying frontend build from builder stage ===" && \
    echo "Contents of builder stage /app/frontend/dist should be copied now..."
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Verify frontend files were copied
RUN echo "=== Verifying frontend files in final image ===" && \
    ls -la ./frontend/ && \
    ls -la ./frontend/dist/ && \
    test -f ./frontend/dist/index.html || (echo "ERROR: Frontend build files not found after copy!" && exit 1) && \
    echo "=== Frontend files successfully copied to final image ==="

# Install Backend Deps
COPY backend/requirements.txt ./backend/
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend/ .

# Copy entrypoint script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Expose port (Render uses PORT env var)
EXPOSE 5000

# Use entrypoint script to verify build before starting
ENTRYPOINT ["/app/docker-entrypoint.sh"]
