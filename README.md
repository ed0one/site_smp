# 🌱 SmartPlant Watering System

A modern, responsive web application for monitoring and controlling an Arduino-based smart plant watering system. Features a beautiful dashboard, real-time sensor monitoring, automated watering controls, and comprehensive settings management.

![SmartPlant Dashboard](./docs/dashboard-preview.png)

## ✨ Features

### 🎯 Dashboard
- **Real-time Monitoring**: Live soil humidity, temperature, and air humidity readings
- **System Status**: Online/offline indicators and connection health
- **Pump Control**: Manual pump control with visual feedback
- **Watering Modes**: Automatic and manual watering modes
- **Smart Alerts**: Visual warnings when plants need attention

### 📊 Analytics
- **Historical Charts**: Interactive 24-hour sensor data visualization
- **Data Summary**: Statistical analysis (min, max, average values)
- **Time Range Selection**: View data from 1 hour to 1 week
- **Chart.js Integration**: Professional, responsive charts

### ⚙️ Settings
- **Humidity Thresholds**: Customizable soil humidity triggers (10-70%)
- **Watering Modes**: Switch between automatic and manual control
- **Scheduling**: Configure watering intervals (6 hours to weekly)
- **Arduino Integration**: Complete API documentation and example code

### 🎨 Modern UI/UX
- **Green Theme**: Beautiful plant-inspired color palette
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Smooth Animations**: Engaging micro-interactions and transitions
- **Accessibility**: WCAG-compliant design elements

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **Chart.js & React-Chartjs-2** - Interactive data visualization
- **FontAwesome** - Beautiful icons and graphics
- **CSS Variables** - Dynamic theming and dark mode
- **Responsive Grid** - Mobile-first design approach

### Backend
- **Node.js & Express** - Fast, lightweight web server
- **SQLite3** - Local database for sensor data and settings
- **CORS** - Cross-origin resource sharing support
- **Node-cron** - Scheduled watering tasks
- **RESTful API** - Clean, documented endpoints

### Hardware Integration
- **Arduino UNO** - Main microcontroller
- **DHT11** - Temperature and air humidity sensor
- **Soil Moisture Sensor** - Capacitive soil humidity measurement
- **Relay Module** - Water pump control
- **ESP8266** - WiFi connectivity (optional)

## 📡 API Endpoints

### Sensor Data
```http
POST /api/data
Content-Type: application/json

{
  "soil": 35.5,
  "temp": 22.1,
  "hum": 65.3,
  "pump": "off"
}
```

### Get Latest Data
```http
GET /api/latest
```

### Control Commands
```http
POST /api/command
Content-Type: application/json

{
  "pump": "on",
  "mode": "manual"
}
```

### Update Settings
```http
PUT /api/settings
Content-Type: application/json

{
  "humidity_threshold": 30,
  "watering_mode": "auto",
  "scheduled_interval": 12
}
```

### Historical Data
```http
GET /api/history?hours=24
```

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone [your-repo-url]
cd smart-plant-system
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit your configuration
nano .env
```

### 3. Start Production Server
```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs smartplant-server
```

### 4. Access Dashboard
Navigate to `http://your-server-ip:5001` to access the dashboard.

## 🔧 Arduino Setup

### Required Components
- Arduino UNO R3
- DHT11 Temperature & Humidity Sensor
- Capacitive Soil Moisture Sensor
- 5V Relay Module
- Water Pump (5-12V)
- ESP8266 WiFi Module (optional)
- Jumper Wires & Breadboard

### Wiring Diagram
```
DHT11:
- VCC → 5V
- GND → GND
- DATA → Pin 2

Soil Sensor:
- VCC → 5V
- GND → GND
- A0 → A0

Relay Module:
- VCC → 5V
- GND → GND
- IN → Pin 7

Water Pump:
- Connect through relay (NO/COM)
```

### Sample Arduino Code
```cpp
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Sensor pins
#define DHT_PIN 2
#define DHT_TYPE DHT11
#define SOIL_PIN A0
#define PUMP_PIN 7

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* server = "http://your-server:5000";

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void loop() {
  // Read sensors
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int soilRaw = analogRead(SOIL_PIN);
  float soilHumidity = map(soilRaw, 0, 1023, 0, 100);
  
  // Check pump status
  bool pumpOn = digitalRead(PUMP_PIN);
  String pumpStatus = pumpOn ? "on" : "off";
  
  // Send data to server
  sendSensorData(soilHumidity, temperature, humidity, pumpStatus);
  
  // Check for commands
  checkCommands();
  
  delay(10000); // Send every 10 seconds
}

void sendSensorData(float soil, float temp, float hum, String pump) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(server) + "/api/data");
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\\"soil\\":" + String(soil) + 
                    ",\\"temp\\":" + String(temp) + 
                    ",\\"hum\\":" + String(hum) + 
                    ",\\"pump\\":\\"" + pump + "\\"}";
    
    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode > 0) {
      Serial.println("Data sent successfully");
    } else {
      Serial.println("Error sending data");
    }
    
    http.end();
  }
}

void checkCommands() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(server) + "/api/latest");
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      // Parse response and check for pump commands
      // Implement pump control logic here
    }
    
    http.end();
  }
}
```

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:
- **Touch-friendly Controls**: Large buttons and intuitive gestures
- **Adaptive Layout**: Optimized grid layouts for different screen sizes
- **Mobile Navigation**: Collapsible navigation for small screens
- **PWA Ready**: Can be installed as a mobile app (future enhancement)

## 🌙 Dark Mode

Toggle between light and dark themes with the button in the header:
- **System Preference**: Respects user's OS theme preference
- **Persistent Storage**: Theme choice saved in browser
- **Smooth Transitions**: Animated theme switching
- **Accessibility**: High contrast ratios in both themes

## 📈 Performance Features

- **Real-time Updates**: 10-second refresh cycles
- **Efficient Rendering**: React optimization with hooks
- **Data Caching**: Smart API response caching
- **Lazy Loading**: Components loaded on demand
- **Responsive Images**: Optimized assets for all screen sizes

## 🔒 Security Considerations

- **Input Validation**: Server-side validation for all API inputs
- **CORS Configuration**: Restricted cross-origin access
- **Error Handling**: Graceful error handling and user feedback
- **Data Sanitization**: Protection against injection attacks

## 🛠️ Development & Deployment

### Development
```bash
npm run dev      # Start both services
npm run server   # Backend only
npm start        # Frontend only
npm test         # Run tests
```

### Production Build
```bash
npm run build    # Create production build
npm run server   # Start production server
```

### Environment Variables
Create a `.env` file:
```env
NODE_ENV=production
PORT=5000
DATABASE_PATH=./database.sqlite
```

## 📊 Database Schema

### sensor_data table
```sql
CREATE TABLE sensor_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  soil_humidity REAL NOT NULL,
  temperature REAL NOT NULL,
  air_humidity REAL NOT NULL,
  pump_status TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### settings table
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  humidity_threshold INTEGER DEFAULT 30,
  watering_mode TEXT DEFAULT 'auto',
  scheduled_interval INTEGER DEFAULT 12,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Chart.js contributors for visualization tools
- FontAwesome for beautiful icons
- Arduino community for hardware inspiration

## 📞 Support

If you have any questions or run into issues, please:
1. Check the [Issues](../../issues) page
2. Read the documentation thoroughly
3. Contact the development team

---

**Built with ❤️ for plant lovers and IoT enthusiasts**