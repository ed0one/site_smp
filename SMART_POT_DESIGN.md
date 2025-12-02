# 🌱 Smart Planting Pot - Physical Design

## 🏗️ Pot System Layout

```
┌─────────────────────────────────┐
│           Plant Pot             │
│  ┌─────────────────────────┐    │
│  │        Plant & Soil     │    │
│  │    [Soil Sensor Here]   │    │
│  │                         │    │
│  │    ┌─[DHT22 Sensor]     │    │
│  │    │                    │    │
│  │    │   [Drip Tube End]  │    │
│  │    │        ↓           │    │
│  └────┴────────────────────┘    │
│                                 │
│  [Drainage Holes]               │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        Water Reservoir          │
│  ┌─────────────────────────┐    │
│  │   [Mini Water Pump]     │    │
│  │        ↑   ↓            │    │
│  │      Water Tube         │    │
│  │                         │    │
│  │    [Water Level]        │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      Electronics Box           │
│  ┌─────────────────────────┐    │
│  │    [ESP32 Board]        │    │
│  │    [Relay Module]       │    │
│  │    [Breadboard]         │    │
│  │    [Wiring]             │    │
│  └─────────────────────────┘    │
│  [Power Cable to Wall]          │
└─────────────────────────────────┘
```

## 📐 Physical Setup Steps

### Step 1: Prepare the Plant Pot
1. **Choose a medium pot**: 20-25cm diameter
2. **Ensure drainage**: Holes at bottom
3. **Add soil**: Leave 3-4cm from top
4. **Plant your plant**: Herbs work great (basil, mint)

### Step 2: Install Soil Sensor
1. **Insert sensor**: Push into soil 5-7cm deep
2. **Position**: Away from drainage holes
3. **Secure wire**: Use small stake if needed
4. **Leave accessible**: For calibration

### Step 3: Set Up Water Reservoir
1. **Choose container**: 1-2 liter plastic bottle/container
2. **Install pump**: Submersible mini pump at bottom
3. **Connect tubing**: From pump to plant pot
4. **Create drip system**: Small holes in tube over soil
5. **Fill with water**: Leave 2-3cm from top

### Step 4: Mount Temperature Sensor
1. **Position DHT22**: Above soil, in shade
2. **Secure**: Small stake or tape to pot rim
3. **Keep dry**: Away from watering area

### Step 5: Electronics Housing
1. **Waterproof box**: Small project box
2. **Mount ESP32**: Inside with breadboard
3. **Position**: Away from water sources
4. **Access**: USB port accessible for programming

## 🔌 Power & Connectivity

### Power Options
- **USB Power**: From computer/wall adapter
- **Power Bank**: For temporary portable use
- **5V DC Adapter**: Most reliable for permanent setup

### WiFi Setup
- Connect ESP32 to your home WiFi
- Access dashboard from any device: `http://your-mac-ip:3002`

## 💧 Watering System Design

### Drip Irrigation
```
Water Reservoir → Pump → Tube → Drip Points → Soil
```

### Flow Control
- **Pump Runtime**: 5-10 seconds per watering
- **Drip Rate**: Adjustable by tube holes size
- **Coverage**: Multiple drip points for even watering

## 🌡️ Sensor Placement

### Soil Moisture Sensor
- **Depth**: 5-7cm (root zone)
- **Distance from stem**: 5-10cm
- **Avoid**: Drainage areas

### DHT22 (Temperature/Humidity)
- **Height**: 10-15cm above soil
- **Position**: Shaded, good air flow
- **Protection**: From direct water spray

## 📦 Assembly Tips

1. **Test Electronics First**: Before final assembly
2. **Weatherproof Connections**: Heat shrink tubing
3. **Secure Wiring**: Prevent water contact
4. **Easy Access**: For maintenance
5. **Start Simple**: Get monitoring working first, add pump later

## 🔧 Maintenance Access

- **Water refill**: Easy reservoir access
- **Sensor cleaning**: Removable for calibration
- **Electronics**: Protected but accessible
- **Plant care**: Normal gardening access

This design gives you a **practical, maintainable smart pot** that monitors soil moisture and can automatically water your plant while being controlled from your Mac!