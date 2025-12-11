#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "--- ChatIA Build Script ---"
echo "Current Directory: $(pwd)"
echo "Node Version: $(node -v)"
echo "NPM Version: $(npm -v)"

# 1. Install Python Dependencies
echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

# 2. Build Frontend
echo "Building Frontend..."
cd frontend
npm install
npm run build

echo "Build finished. Checking dist folder..."
if [ -d "dist" ]; then
    echo "dist folder exists."
    ls -la dist
else
    echo "ERROR: dist folder NOT found!"
    exit 1
fi

cd ..

echo "Build complete!"
