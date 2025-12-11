#!/usr/bin/env bash
set -o errexit

echo "==> Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Build complete!"
