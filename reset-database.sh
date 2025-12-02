#!/bin/bash

# SmartPlant Database Reset Script
# This script completely clears all data and creates fresh tables

echo "🗑️  Resetting SmartPlant Database..."

# Stop any running processes
echo "🛑 Stopping SmartPlant processes..."
pm2 delete smartplant-server 2>/dev/null || true
pkill -f "node.*server" 2>/dev/null || true

# Remove all database files
echo "🧹 Removing all database files..."
find . -name "*.sqlite" -delete 2>/dev/null || true
find . -name "*.db" -delete 2>/dev/null || true
rm -f server/database.sqlite
rm -f server/production.sqlite
rm -f *.sqlite *.db

# Remove logs
echo "📋 Cleaning logs..."
rm -rf logs/
mkdir -p logs

# Clear any cached data
echo "🔄 Clearing caches..."
rm -rf tmp/ temp/

echo "✅ Database reset complete!"
echo ""
echo "🚀 To start fresh:"
echo "  1. Run: ./start-production.sh"
echo "  2. Connect your Arduino with real sensors"
echo "  3. Fresh database will be created automatically"
echo ""
echo "📊 The system is now ready for real sensor data only!"