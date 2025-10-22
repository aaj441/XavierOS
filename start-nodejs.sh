#!/bin/bash

# Blue Ocean Explorer (XavierOS) Start Script
echo "🚀 Starting Blue Ocean Explorer (XavierOS)..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are we in the right directory?"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm prisma generate

# Start the application
echo "🌐 Starting XavierOS application..."
pnpm start
