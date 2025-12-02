const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cron = require('node-cron');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Sensor data table
  db.run(`
    CREATE TABLE IF NOT EXISTS sensor_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      soil_humidity REAL NOT NULL,
      temperature REAL NOT NULL,
      air_humidity REAL NOT NULL,
      pump_status TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      humidity_threshold INTEGER DEFAULT 30,
      watering_mode TEXT DEFAULT 'auto',
      scheduled_interval INTEGER DEFAULT 12,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default settings if not exists
  db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
    if (row.count === 0) {
      db.run(`
        INSERT INTO settings (humidity_threshold, watering_mode, scheduled_interval)
        VALUES (30, 'auto', 12)
      `);
    }
  });
});

// Store current system status
let systemStatus = {
  isOnline: true,
  lastHeartbeat: new Date(),
  pumpStatus: 'off',
  currentMode: 'auto'
};

// API Endpoints

// POST /api/data - Receive data from Arduino
app.post('/api/data', (req, res) => {
  const { soil, temp, hum, pump } = req.body;
  
  if (soil === undefined || temp === undefined || hum === undefined || pump === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Insert data into database
  db.run(
    'INSERT INTO sensor_data (soil_humidity, temperature, air_humidity, pump_status) VALUES (?, ?, ?, ?)',
    [soil, temp, hum, pump],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Update system status
      systemStatus.isOnline = true;
      systemStatus.lastHeartbeat = new Date();
      systemStatus.pumpStatus = pump;
      
      res.json({ 
        success: true, 
        id: this.lastID,
        message: 'Data received successfully' 
      });
    }
  );
});

// GET /api/latest - Get latest sensor data
app.get('/api/latest', (req, res) => {
  db.get(
    'SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1',
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get current settings
      db.get('SELECT * FROM settings ORDER BY id DESC LIMIT 1', (err, settings) => {
        if (err) {
          console.error('Settings error:', err);
          return res.status(500).json({ error: 'Settings error' });
        }
        
        res.json({
          sensorData: row || null,
          systemStatus: systemStatus,
          settings: settings || {
            humidity_threshold: 30,
            watering_mode: 'auto',
            scheduled_interval: 12
          }
        });
      });
    }
  );
});

// GET /api/history - Get historical data for charts (last 24 hours)
app.get('/api/history', (req, res) => {
  const hoursBack = req.query.hours || 24;
  
  db.all(
    `SELECT soil_humidity, temperature, air_humidity, pump_status, timestamp 
     FROM sensor_data 
     WHERE timestamp >= datetime('now', '-${hoursBack} hours')
     ORDER BY timestamp ASC`,
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(rows);
    }
  );
});

// POST /api/command - Send command to Arduino (pump control)
app.post('/api/command', (req, res) => {
  const { pump, mode } = req.body;
  
  if (!pump && !mode) {
    return res.status(400).json({ error: 'Missing pump or mode command' });
  }
  
  // Update system status
  if (pump) {
    systemStatus.pumpStatus = pump;
  }
  if (mode) {
    systemStatus.currentMode = mode;
  }
  
  // Here you would typically send HTTP request to Arduino
  // For now, we'll simulate the response
  console.log(`Command sent: ${pump ? 'Pump: ' + pump : ''} ${mode ? 'Mode: ' + mode : ''}`);
  
  res.json({ 
    success: true, 
    command: { pump, mode },
    message: 'Command sent successfully' 
  });
});

// PUT /api/settings - Update system settings
app.put('/api/settings', (req, res) => {
  const { humidity_threshold, watering_mode, scheduled_interval } = req.body;
  
  db.run(
    `UPDATE settings SET 
     humidity_threshold = COALESCE(?, humidity_threshold),
     watering_mode = COALESCE(?, watering_mode),
     scheduled_interval = COALESCE(?, scheduled_interval),
     last_updated = CURRENT_TIMESTAMP
     WHERE id = (SELECT id FROM settings ORDER BY id DESC LIMIT 1)`,
    [humidity_threshold, watering_mode, scheduled_interval],
    function(err) {
      if (err) {
        console.error('Settings update error:', err);
        return res.status(500).json({ error: 'Settings update failed' });
      }
      
      res.json({ 
        success: true, 
        message: 'Settings updated successfully' 
      });
    }
  );
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    systemStatus: systemStatus 
  });
});

// Check system online status (mark offline if no data received in 5 minutes)
setInterval(() => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (systemStatus.lastHeartbeat < fiveMinutesAgo) {
    systemStatus.isOnline = false;
  }
}, 60000); // Check every minute

// Scheduled watering task (runs every hour, checks if watering is needed)
cron.schedule('0 * * * *', () => {
  if (systemStatus.currentMode === 'auto') {
    // Get latest settings and sensor data to determine if watering is needed
    db.get('SELECT * FROM settings ORDER BY id DESC LIMIT 1', (err, settings) => {
      if (!err && settings) {
        db.get('SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1', (err, data) => {
          if (!err && data) {
            if (data.soil_humidity < settings.humidity_threshold) {
              console.log('Auto watering triggered - soil humidity below threshold');
              // Here you would send command to Arduino to start watering
              systemStatus.pumpStatus = 'on';
            }
          }
        });
      }
    });
  }
});

// Serve static files from React build (in production)
// Commented out for now to avoid routing conflicts
/*
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}
*/

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌱 PlantCare Server running on port ${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🌐 Access from phone: http://172.20.10.2:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🌱 Shutting down PlantCare Server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('📊 Database connection closed.');
    }
    process.exit(0);
  });
});