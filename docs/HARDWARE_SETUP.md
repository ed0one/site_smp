# 🌱 SmartPlant Hardware Setup Guide

## Required Components

### Core Components
- **ESP32 Development Board** (recommended) or Arduino UNO + WiFi Module
- **Capacitive Soil Moisture Sensor** (analog output)
- **DHT22 Temperature & Humidity Sensor**
- **5V Single Channel Relay Module**
- **12V DC Water Pump** (submersible)
- **12V Power Supply** (for pump)
- **Status LED** (optional)

### Additional Supplies
- Jumper wires (male-to-male, male-to-female)
- Breadboard or PCB
- Waterproof enclosure for electronics
- Silicone tubing for water flow
- Power adapters and connectors

## Hardware Wiring Diagram

### ESP32 Pin Connections

```
ESP32 Pin    →    Component
─────────────────────────────────
GPIO36 (A0)  →    Soil Moisture Sensor (AOUT)
GPIO4        →    DHT22 (Data)
GPIO2        →    Relay Module (IN)
GPIO5        →    Status LED (Anode)
3.3V         →    DHT22 (VCC), Status LED (via resistor)
5V           →    Soil Moisture Sensor (VCC), Relay (VCC)
GND          →    All GND connections
```

### Detailed Wiring

#### 1. Soil Moisture Sensor
```
Sensor Pin  →  ESP32 Pin
VCC         →  5V
GND         →  GND
AOUT        →  GPIO36 (A0)
```

#### 2. DHT22 Temperature/Humidity Sensor
```
DHT22 Pin   →  ESP32 Pin
VCC         →  3.3V
Data        →  GPIO4
GND         →  GND
```

#### 3. Relay Module (for Pump Control)
```
Relay Pin   →  Connection
VCC         →  5V
GND         →  GND
IN          →  GPIO2
NO (Normal) →  12V Pump (+)
COM (Common)→  12V Power Supply (+)
```

#### 4. Status LED (Optional)
```
LED Pin     →  ESP32 Pin
Anode       →  GPIO5 (via 220Ω resistor)
Cathode     →  GND
```

## Physical Assembly

### 1. Electronics Enclosure
- Use waterproof IP65+ rated enclosure
- Mount ESP32 and relay inside
- Cable glands for sensor wires
- Ventilation for heat dissipation

### 2. Sensor Placement
- **Soil Moisture**: Insert 5-8cm deep in soil
- **DHT22**: Mount in shaded, ventilated area
- Use weatherproof sensor housings

### 3. Water System
- Connect pump to water reservoir
- Use drip irrigation or soaker hose
- Install pump filter to prevent clogging
- Test water flow rate and coverage

## Safety Considerations

### Electrical Safety
- ✅ Use GFCI-protected outlets
- ✅ Seal all electrical connections
- ✅ Keep electronics away from water
- ✅ Use proper gauge wiring for pump current

### Water Safety
- ✅ Install overflow drain in reservoir
- ✅ Use food-grade tubing for plants
- ✅ Regular cleaning of pump and filters
- ✅ Water level monitoring

## Component Specifications

### ESP32 Development Board
- **Operating Voltage**: 3.3V
- **Input Voltage**: 7-12V
- **WiFi**: 802.11 b/g/n
- **GPIO Pins**: 30+ available
- **ADC Resolution**: 12-bit (0-4095)

### Capacitive Soil Moisture Sensor
- **Operating Voltage**: 3.3V - 5.5V
- **Output Type**: Analog (0-3.3V)
- **Measurement Range**: 0-100% moisture
- **Corrosion Resistant**: Yes (capacitive)

### DHT22 Temperature & Humidity Sensor
- **Temperature Range**: -40°C to +125°C (±0.5°C accuracy)
- **Humidity Range**: 0-99.9% RH (±2-5% accuracy)
- **Operating Voltage**: 3.3V - 6V
- **Communication**: Single-wire digital

### 5V Relay Module
- **Control Voltage**: 3.3V - 5V
- **Contact Rating**: 10A @ 250VAC, 10A @ 30VDC
- **Switching Time**: <10ms
- **LED Indicator**: Yes

### 12V Water Pump
- **Voltage**: 12V DC
- **Current**: 1-3A (check specifications)
- **Flow Rate**: 2-5 L/min
- **Head Height**: 2-5 meters
- **Type**: Submersible or inline

## Testing Checklist

### Before Power-On
- [ ] Double-check all wiring connections
- [ ] Verify power supply voltages
- [ ] Ensure no short circuits
- [ ] Check sensor orientations
- [ ] Confirm relay wiring polarity

### Initial Testing
- [ ] Upload Arduino code
- [ ] Monitor serial output
- [ ] Test WiFi connection
- [ ] Verify sensor readings
- [ ] Test pump activation (dry test)
- [ ] Check server communication

### System Integration
- [ ] Calibrate soil moisture sensor
- [ ] Test automatic watering logic
- [ ] Verify dashboard updates
- [ ] Test manual pump control
- [ ] Check safety timeouts

## Troubleshooting

### Common Issues

#### No WiFi Connection
- Check SSID and password
- Verify router compatibility
- Check signal strength
- Try different WiFi channels

#### Incorrect Sensor Readings
- Calibrate soil moisture sensor
- Check DHT22 wiring and power
- Verify ADC reference voltage
- Clean sensor contacts

#### Pump Not Working
- Check relay wiring
- Verify pump power supply
- Test relay with multimeter
- Check pump priming

#### No Server Communication
- Verify server IP address
- Check firewall settings
- Test API endpoints manually
- Monitor network traffic

## Maintenance Schedule

### Weekly
- Check water reservoir level
- Inspect plant health
- Review sensor data trends

### Monthly
- Clean soil moisture sensor
- Check all electrical connections
- Test pump operation
- Update calibration if needed

### Seasonally
- Deep clean all components
- Replace worn tubing
- Update software
- Backup historical data