#!/bin/bash

# Function to handle cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p)
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo "Starting ChatIA..."

# Start Backend
echo "Starting Flask Backend on port 5000..."
cd backend
# Create venv if not exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi
flask run --port=5000 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting React Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Servers running. Press Ctrl+C to stop."
wait
