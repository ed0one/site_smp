/*
 * SmartPlant Watering System - ESP32 Version
 * 
 * Hardware Requirements:
 * - ESP32 Development Board
 * - Capacitive Soil Moisture Sensor (analog)
 * - DHT22 Temperature & Humidity Sensor
 * - 5V Relay Module for Water Pump
 * - 12V Water Pump
 * - Jumper wires and breadboard
 * 
 * Pin Configuration:
 * - Soil Moisture: A0 (GPIO36)
 * - DHT22: GPIO4
 * - Relay: GPIO2
 * - LED (Status): GPIO5
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// WiFi Configuration
const char* ssid = "campus";
const char* password = "barcelona";

// Server Configuration
const char* serverURL = "http://172.20.8.54:5001"; // Update with your server IP
const char* dataEndpoint = "/api/data";
const char* commandEndpoint = "/api/latest";

// Pin Definitions
#define SOIL_MOISTURE_PIN A0    // Analog pin for soil sensor
#define DHT_PIN 4               // DHT22 data pin
#define RELAY_PIN 2             // Relay control pin
#define STATUS_LED_PIN 5        // Status LED pin

// Sensor Configuration
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// System Variables
float soilMoisture = 0;
float temperature = 0;
float airHumidity = 0;
String pumpStatus = "off";
String systemMode = "auto";
bool wifiConnected = false;

// Timing Variables
unsigned long lastSensorRead = 0;
unsigned long lastDataSent = 0;
unsigned long lastCommandCheck = 0;
unsigned long pumpStartTime = 0;
const unsigned long SENSOR_INTERVAL = 5000;    // Read sensors every 5 seconds
const unsigned long DATA_SEND_INTERVAL = 30000; // Send data every 30 seconds
const unsigned long COMMAND_CHECK_INTERVAL = 10000; // Check for commands every 10 seconds
const unsigned long PUMP_MAX_RUNTIME = 30000;   // Max pump runtime: 30 seconds

// Soil moisture calibration values (adjust based on your sensor)
const int DRY_SOIL_VALUE = 4095;    // Sensor value in completely dry soil
const int WET_SOIL_VALUE = 1500;    // Sensor value in very wet soil

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("🌱 SmartPlant System Starting...");
  
  // Initialize pins
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);    // Pump OFF
  digitalWrite(STATUS_LED_PIN, LOW); // Status LED OFF
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("📡 DHT22 sensor initialized");
  
  // Connect to WiFi
  connectToWiFi();
  
  Serial.println("✅ SmartPlant System Ready!");
  Serial.println("📊 Starting sensor monitoring...");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    digitalWrite(STATUS_LED_PIN, LOW);
    Serial.println("❌ WiFi disconnected, attempting to reconnect...");
    connectToWiFi();
  } else {
    wifiConnected = true;
    digitalWrite(STATUS_LED_PIN, HIGH); // Status LED ON when connected
  }
  
  // Read sensors
  if (currentTime - lastSensorRead >= SENSOR_INTERVAL) {
    readSensors();
    lastSensorRead = currentTime;
  }
  
  // Send data to server
  if (wifiConnected && currentTime - lastDataSent >= DATA_SEND_INTERVAL) {
    sendSensorData();
    lastDataSent = currentTime;
  }
  
  // Check for server commands
  if (wifiConnected && currentTime - lastCommandCheck >= COMMAND_CHECK_INTERVAL) {
    checkServerCommands();
    lastCommandCheck = currentTime;
  }
  
  // Safety check: Auto-stop pump after max runtime
  if (pumpStatus == "on" && currentTime - pumpStartTime > PUMP_MAX_RUNTIME) {
    stopPump("Safety timeout");
  }
  
  delay(100); // Small delay to prevent watchdog issues
}

void connectToWiFi() {
  Serial.print("🌐 Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📡 IP Address: ");
    Serial.println(WiFi.localIP());
    wifiConnected = true;
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
    wifiConnected = false;
  }
}

void readSensors() {
  // Read soil moisture
  int rawSoilValue = analogRead(SOIL_MOISTURE_PIN);
  soilMoisture = map(rawSoilValue, DRY_SOIL_VALUE, WET_SOIL_VALUE, 0, 100);
  soilMoisture = constrain(soilMoisture, 0, 100);
  
  // Read temperature and humidity
  temperature = dht.readTemperature();
  airHumidity = dht.readHumidity();
  
  // Check if DHT readings are valid
  if (isnan(temperature) || isnan(airHumidity)) {
    Serial.println("⚠️  Failed to read from DHT sensor!");
    temperature = -999; // Error value
    airHumidity = -999;  // Error value
  }
  
  // Print sensor readings
  Serial.println("📊 Sensor Readings:");
  Serial.print("   Soil Moisture: "); Serial.print(soilMoisture); Serial.println("%");
  Serial.print("   Temperature: "); Serial.print(temperature); Serial.println("°C");
  Serial.print("   Air Humidity: "); Serial.print(airHumidity); Serial.println("%");
  Serial.print("   Pump Status: "); Serial.println(pumpStatus);
  Serial.println();
}

void sendSensorData() {
  if (!wifiConnected) return;
  
  HTTPClient http;
  String url = String(serverURL) + String(dataEndpoint);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["soil"] = round(soilMoisture * 10) / 10.0;
  doc["temp"] = round(temperature * 10) / 10.0;
  doc["hum"] = round(airHumidity * 10) / 10.0;
  doc["pump"] = pumpStatus;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.print("📤 Sending data: ");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("✅ Server response (");
    Serial.print(httpResponseCode);
    Serial.print("): ");
    Serial.println(response);
  } else {
    Serial.print("❌ HTTP Error: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

void checkServerCommands() {
  if (!wifiConnected) return;
  
  HTTPClient http;
  String url = String(serverURL) + String(commandEndpoint);
  
  http.begin(url);
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    
    // Parse JSON response
    StaticJsonDocument<1000> doc;
    deserializeJson(doc, response);
    
    // Check system status and settings
    if (doc.containsKey("systemStatus")) {
      String serverPumpStatus = doc["systemStatus"]["pumpStatus"];
      String serverMode = doc["systemStatus"]["currentMode"];
      
      // Update system mode
      if (serverMode != systemMode) {
        systemMode = serverMode;
        Serial.print("🔄 Mode changed to: ");
        Serial.println(systemMode);
      }
      
      // Handle pump commands
      if (serverPumpStatus != pumpStatus) {
        if (serverPumpStatus == "on") {
          startPump("Server command");
        } else {
          stopPump("Server command");
        }
      }
    }
    
    // Get settings for automatic watering
    if (systemMode == "auto" && doc.containsKey("settings")) {
      int humidityThreshold = doc["settings"]["humidity_threshold"];
      
      // Auto watering logic
      if (soilMoisture < humidityThreshold && pumpStatus == "off") {
        startPump("Auto watering triggered");
      } else if (soilMoisture > (humidityThreshold + 15) && pumpStatus == "on") {
        stopPump("Auto watering complete");
      }
    }
    
  } else {
    Serial.print("❌ Command check failed: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

void startPump(String reason) {
  if (pumpStatus == "on") return; // Already running
  
  digitalWrite(RELAY_PIN, HIGH);
  pumpStatus = "on";
  pumpStartTime = millis();
  
  Serial.print("🚰 PUMP STARTED: ");
  Serial.println(reason);
  
  // Blink status LED to indicate pump activity
  for (int i = 0; i < 3; i++) {
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(200);
    digitalWrite(STATUS_LED_PIN, HIGH);
    delay(200);
  }
}

void stopPump(String reason) {
  if (pumpStatus == "off") return; // Already stopped
  
  digitalWrite(RELAY_PIN, LOW);
  pumpStatus = "off";
  pumpStartTime = 0;
  
  Serial.print("🛑 PUMP STOPPED: ");
  Serial.println(reason);
}

// Status monitoring function
void printSystemStatus() {
  Serial.println("\n=== SYSTEM STATUS ===");
  Serial.print("WiFi: "); Serial.println(wifiConnected ? "Connected" : "Disconnected");
  Serial.print("Mode: "); Serial.println(systemMode);
  Serial.print("Pump: "); Serial.println(pumpStatus);
  Serial.print("Uptime: "); Serial.print(millis() / 1000); Serial.println(" seconds");
  Serial.println("==================\n");
}