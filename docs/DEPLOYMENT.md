# 🚀 SmartPlant Production Deployment Guide

## Prerequisites

### Hardware Requirements
- **Raspberry Pi 4** (recommended) or any Linux/Windows server
- **Minimum 2GB RAM**, 16GB storage
- **Reliable internet connection**
- **Power supply with UPS** (recommended)

### Software Requirements
- **Node.js 18+** 
- **npm or yarn**
- **Git**
- **PM2** (for production process management)

## 1. Server Setup

### Install Node.js on Raspberry Pi
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## 2. Application Deployment

### Clone and Setup
```bash
# Clone your repository
git clone <your-repo-url> smartplant
cd smartplant

# Install dependencies
npm install

# Install production dependencies only
npm ci --only=production
```

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env
```

**Essential .env Settings:**
```bash
NODE_ENV=production
PORT=5001
DATABASE_PATH=./server/production.sqlite
CORS_ORIGIN=http://your-domain.com,http://192.168.1.100:3000
```

### Build Frontend
```bash
# Build React app for production
npm run build

# Test the build
npm run server
```

## 3. Production Configuration

### Create PM2 Ecosystem File
```bash
# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'smartplant-server',
    script: 'server/server.js',
    cwd: '/home/pi/smartplant',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
```

### Create Log Directory
```bash
mkdir -p logs
```

### Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs smartplant-server

# Save PM2 configuration
pm2 save
pm2 startup
```

## 4. Network Configuration

### Find Your Server IP
```bash
# Get local IP address
hostname -I

# Example output: 192.168.1.100
```

### Configure Firewall
```bash
# Allow required ports
sudo ufw allow 5001/tcp
sudo ufw allow ssh
sudo ufw enable
```

### Static IP Configuration (Optional)
```bash
# Edit network config
sudo nano /etc/dhcpcd.conf

# Add these lines (adjust to your network)
interface wlan0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

## 5. Arduino Configuration

### Update Arduino Code
1. Open `arduino/SmartPlant_ESP32.ino`
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "Your-WiFi-Name";
   const char* password = "Your-WiFi-Password";
   ```
3. Update server IP:
   ```cpp
   const char* serverURL = "http://192.168.1.100:5001";
   ```

### Upload to ESP32
1. Connect ESP32 to computer
2. Open Arduino IDE
3. Install required libraries:
   - WiFi
   - HTTPClient  
   - ArduinoJson
   - DHT sensor library
4. Select ESP32 board and port
5. Upload the code

## 6. System Testing

### Test Server API
```bash
# Health check
curl http://localhost:5001/api/health

# Test data endpoint
curl -X POST http://localhost:5001/api/data \
  -H "Content-Type: application/json" \
  -d '{"soil": 45, "temp": 23, "hum": 65, "pump": "off"}'
```

### Test Frontend Access
- Open browser: `http://192.168.1.100:5001`
- Test all dashboard functions
- Verify charts load correctly

### Test Arduino Communication
1. Monitor Arduino Serial Output
2. Check data appears in dashboard
3. Test manual pump controls
4. Verify automatic watering

## 7. Production Monitoring

### System Monitoring Commands
```bash
# Check system resources
htop

# Check disk space
df -h

# Check PM2 processes
pm2 monit

# Check logs
pm2 logs --lines 100

# Restart if needed
pm2 restart smartplant-server
```

### Database Backup Script
```bash
# Create backup script
cat > backup_database.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/pi/smartplant/backups"
DB_FILE="/home/pi/smartplant/server/production.sqlite"

mkdir -p $BACKUP_DIR
cp $DB_FILE "$BACKUP_DIR/database_backup_$DATE.sqlite"

# Keep only last 7 backups
ls -t $BACKUP_DIR/database_backup_*.sqlite | tail -n +8 | xargs rm -f
EOF

chmod +x backup_database.sh
```

### Setup Cron for Backups
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/pi/smartplant/backup_database.sh
```

## 8. Remote Access (Optional)

### SSH Access
```bash
# Enable SSH
sudo systemctl enable ssh
sudo systemctl start ssh

# Access remotely
ssh pi@192.168.1.100
```

### VPN Setup (Recommended)
Set up WireGuard VPN for secure remote access to your SmartPlant system when away from home.

## 9. Troubleshooting

### Common Issues

#### Server Won't Start
```bash
# Check logs
pm2 logs smartplant-server

# Check port availability
sudo netstat -tlnp | grep 5001

# Check file permissions
ls -la server/server.js
```

#### Arduino Connection Issues
1. Check WiFi credentials
2. Verify server IP address
3. Check firewall settings
4. Monitor Arduino serial output

#### Database Errors
```bash
# Check database file
ls -la server/production.sqlite

# Test database connection
sqlite3 server/production.sqlite ".tables"
```

### Performance Optimization

#### System Optimization
```bash
# Increase swap file (for Raspberry Pi)
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set CONF_SWAPSIZE=1024
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

#### Database Optimization
```bash
# Add to cron for weekly optimization
0 3 * * 0 echo "VACUUM;" | sqlite3 /home/pi/smartplant/server/production.sqlite
```

## 10. Maintenance Checklist

### Daily
- [ ] Check system status via dashboard
- [ ] Verify sensor data updates
- [ ] Check plant health

### Weekly  
- [ ] Review system logs
- [ ] Check disk space
- [ ] Verify backup creation
- [ ] Clean sensor if needed

### Monthly
- [ ] Update system packages
- [ ] Check hardware connections
- [ ] Test emergency procedures
- [ ] Review data trends

### Quarterly
- [ ] Full system backup
- [ ] Replace pump filters
- [ ] Update software
- [ ] Security audit

## Success Metrics

Your SmartPlant system is successfully deployed when:

✅ **Server Status**: PM2 shows green status  
✅ **Arduino Connection**: Data flowing every 30 seconds  
✅ **Dashboard Access**: Responsive on all devices  
✅ **Automatic Watering**: Triggers based on soil moisture  
✅ **Data Logging**: Historical charts show trends  
✅ **Remote Access**: Works from anywhere  
✅ **Backup System**: Daily database backups  

Your SmartPlant system is now ready for real-world production use! 🌱🚀