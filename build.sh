#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Building ChatIA..."

# 1. Install Python Dependencies
echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

# 2. Build Frontend
echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Build complete!"
