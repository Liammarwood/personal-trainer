#!/bin/bash

# Start Personal Trainer Application (React + Flask)

echo "=========================================="
echo "Personal Trainer - Starting Application"
echo "=========================================="
echo ""

# Check if Python is available
if ! command -v python &> /dev/null
then
    echo "❌ Python not found. Please install Python 3.10+"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null
then
    echo "❌ npm not found. Please install Node.js 16+"
    exit 1
fi

# Start Flask backend in background
echo "🚀 Starting Flask API server (port 5000)..."
cd "$(dirname "$0")"
python run.py &
FLASK_PID=$!
echo "   Flask PID: $FLASK_PID"

# Wait for Flask to start
sleep 3

# Start React frontend
echo ""
echo "🚀 Starting React frontend (port 3000)..."
cd frontend
npm run dev

# Cleanup on exit
trap "echo ''; echo '🛑 Shutting down servers...'; kill $FLASK_PID 2>/dev/null; exit 0" EXIT INT TERM
