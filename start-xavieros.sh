#!/bin/bash

# XavierOS (Blue Ocean Explorer) Start Script
echo "🚀 Starting XavierOS (Blue Ocean Explorer)..."

# Set required environment variables
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3000}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are we in the right directory?"
    exit 1
fi

if [ ! -f "app.config.ts" ]; then
    echo "❌ Error: app.config.ts not found."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Generate Prisma client if prisma directory exists
if [ -d "prisma" ]; then
    echo "🔧 Generating Prisma client..."
    pnpm prisma generate
fi

# Build the application
echo "🏗️ Building XavierOS..."
pnpm build

# Start the application
echo "🌐 Starting XavierOS server on port $PORT..."
pnpm start
