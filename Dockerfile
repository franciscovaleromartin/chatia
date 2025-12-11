# Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Setup backend
FROM python:3.10-slim

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Frontend Build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Install Backend Deps
COPY backend/requirements.txt ./backend/
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend/ .

# Expose port
EXPOSE 5000

# Run
CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", "app:app", "--bind", "0.0.0.0:5000"]
