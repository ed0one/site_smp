#!/bin/bash
# 🌱 Smart Planting Pot - Simple macOS Startup Script

echo "🌱 Starting PlantCare System..."

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Please run this script from the site_smp directory"
    exit 1
fi

# Start backend server with PM2
echo "🚀 Starting backend server (port 5001)..."
pm2 start ecosystem.config.js

# Wait a moment for server to start
sleep 2

# Check if server is running
if curl -f -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Backend server online at http://localhost:5001"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

# Start frontend in background (with network access)
echo "🎨 Starting frontend dashboard (port 3002)..."
HOST=0.0.0.0 PORT=3002 npm start &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

echo ""
echo "🎉 PlantCare System Started!"
echo ""
echo "💻 Mac Dashboard: http://localhost:3002"
echo "📱 Phone Dashboard: http://172.20.10.2:3002"
echo "🔧 API: http://172.20.10.2:5001"
echo ""
echo "💡 To stop:"
echo "   pm2 stop smartplant-server  # Stop backend"
echo "   kill $FRONTEND_PID           # Stop frontend"
echo ""
echo "🌱 Ready for your Arduino sensors!"

# Keep script running to show status
echo "Press Ctrl+C to stop monitoring..."
while true; do
    sleep 60
    if ! curl -f -s http://localhost:5001/api/health > /dev/null; then
        echo "⚠️  Backend server appears to be down"
    fi
done