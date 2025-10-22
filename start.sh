#!/bin/bash

# A5 Browser Use FastAPI Start Script
echo "🚀 Starting A5 Browser Use FastAPI Application..."

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: main.py not found. Are we in the right directory?"
    exit 1
fi

if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Start the FastAPI application
echo "🌐 Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1