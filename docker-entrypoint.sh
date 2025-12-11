#!/bin/bash
set -e

echo "=== Docker Container Starting ==="
echo "Current directory: $(pwd)"
echo "Checking frontend build..."

# Check if frontend dist exists and has index.html
if [ ! -f "/app/frontend/dist/index.html" ]; then
    echo "ERROR: Frontend build missing at /app/frontend/dist/index.html"
    echo "Contents of /app/frontend:"
    ls -la /app/frontend/ || echo "Frontend directory not found"

    if [ -d "/app/frontend/dist" ]; then
        echo "Contents of /app/frontend/dist:"
        ls -la /app/frontend/dist/
    else
        echo "Dist directory does not exist"
    fi

    echo ""
    echo "CRITICAL ERROR: Frontend build files are missing!"
    echo "The Docker build did not complete successfully."
    exit 1
fi

echo "✓ Frontend build found at /app/frontend/dist/"
echo "Contents of dist:"
ls -la /app/frontend/dist/

echo "=== Starting Gunicorn ==="
exec gunicorn --worker-class eventlet -w 1 app:app --bind 0.0.0.0:${PORT:-5000}
