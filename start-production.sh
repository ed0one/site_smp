#!/bin/bash

# SmartPlant Production Startup Script

echo "🌱 Starting SmartPlant Production Server..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found! Copying from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration"
    echo "Then run this script again."
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Check if production dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing production dependencies..."
    npm ci --only=production
fi

# Stop any existing instances
echo "🛑 Stopping existing SmartPlant processes..."
pm2 delete smartplant-server 2>/dev/null || true

# Start the application
echo "🚀 Starting SmartPlant server..."
pm2 start ecosystem.config.js

# Show status
echo "📊 Application Status:"
pm2 status

# Show logs
echo "📋 Recent logs:"
pm2 logs smartplant-server --lines 20

echo ""
echo "✅ SmartPlant is running!"
echo "📱 Dashboard: http://$(hostname -I | awk '{print $1}'):5001"
echo ""
echo "Useful commands:"
echo "  pm2 status                 - Check status"
echo "  pm2 logs smartplant-server - View logs"
echo "  pm2 restart smartplant-server - Restart"
echo "  pm2 stop smartplant-server - Stop"
echo ""