import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTint, 
  faThermometerHalf, 
  faWater, 
  faPlay,
  faStop,
  faClock,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

function Dashboard({ 
  sensorData, 
  systemStatus, 
  settings,
  onPumpCommand, 
  onModeChange,
  formatTimestamp 
}) {
  
  // Get status classes for sensors based on values
  const getSoilHumidityStatus = (value) => {
    if (!value) return 'unknown';
    if (value < settings.humidity_threshold) return 'critical';
    if (value < settings.humidity_threshold + 10) return 'warning';
    return 'good';
  };

  const getTemperatureStatus = (temp) => {
    if (!temp) return 'unknown';
    if (temp < 15 || temp > 35) return 'warning';
    return 'good';
  };

  const getAirHumidityStatus = (humidity) => {
    if (!humidity) return 'unknown';
    if (humidity < 30 || humidity > 80) return 'warning';
    return 'good';
  };

  return (
    <div className="dashboard">
      {/* System Status Cards */}
      <div className="status-cards">
        <div className="status-card mode-card">
          <div className="card-header">
            <h3>Watering Mode</h3>
          </div>
          <div className="card-body">
            <div className="mode-display">
              <span className={`mode-badge ${systemStatus.currentMode}`}>
                {systemStatus.currentMode?.toUpperCase()}
              </span>
            </div>
            <div className="mode-controls">
              <button
                className={`mode-btn ${systemStatus.currentMode === 'auto' ? 'active' : ''}`}
                onClick={() => onModeChange('auto')}
              >
                Auto
              </button>
              <button
                className={`mode-btn ${systemStatus.currentMode === 'manual' ? 'active' : ''}`}
                onClick={() => onModeChange('manual')}
              >
                Manual
              </button>
            </div>
          </div>
        </div>

        <div className="status-card pump-card">
          <div className="card-header">
            <h3>Water Pump</h3>
          </div>
          <div className="card-body">
            <div className="pump-status">
              <FontAwesomeIcon 
                icon={faWater} 
                className={`pump-icon ${systemStatus.pumpStatus === 'on' ? 'active' : ''}`}
              />
              <span className={`pump-status-text ${systemStatus.pumpStatus}`}>
                {systemStatus.pumpStatus?.toUpperCase()}
              </span>
            </div>
            <div className="pump-controls">
              <button
                className={`pump-btn start ${systemStatus.pumpStatus === 'on' ? 'active' : ''}`}
                onClick={() => onPumpCommand('on')}
                disabled={systemStatus.currentMode === 'auto'}
              >
                <FontAwesomeIcon icon={faPlay} /> Start
              </button>
              <button
                className={`pump-btn stop ${systemStatus.pumpStatus === 'off' ? 'active' : ''}`}
                onClick={() => onPumpCommand('off')}
              >
                <FontAwesomeIcon icon={faStop} /> Stop
              </button>
            </div>
            {systemStatus.currentMode === 'auto' && (
              <p className="pump-note">Manual control disabled in auto mode</p>
            )}
          </div>
        </div>
      </div>

      {/* Sensor Data Cards */}
      <div className="sensor-cards">
        {/* Soil Humidity Card */}
        <div className={`sensor-card soil-humidity ${getSoilHumidityStatus(sensorData?.soil_humidity)}`}>
          <div className="card-header">
            <FontAwesomeIcon icon={faTint} />
            <h3>Soil Humidity</h3>
          </div>
          <div className="card-body">
            <div className="sensor-value">
              <span className="value">
                {sensorData?.soil_humidity?.toFixed(1) || '--'}
              </span>
              <span className="unit">%</span>
            </div>
            <div className="sensor-info">
              <p>Threshold: {settings.humidity_threshold}%</p>
              {sensorData?.soil_humidity < settings.humidity_threshold && (
                <div className="alert">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>Needs watering</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Temperature Card */}
        <div className={`sensor-card temperature ${getTemperatureStatus(sensorData?.temperature)}`}>
          <div className="card-header">
            <FontAwesomeIcon icon={faThermometerHalf} />
            <h3>Temperature</h3>
          </div>
          <div className="card-body">
            <div className="sensor-value">
              <span className="value">
                {sensorData?.temperature?.toFixed(1) || '--'}
              </span>
              <span className="unit">°C</span>
            </div>
            <div className="sensor-info">
              <p>Optimal: 15-35°C</p>
            </div>
          </div>
        </div>

        {/* Air Humidity Card */}
        <div className={`sensor-card air-humidity ${getAirHumidityStatus(sensorData?.air_humidity)}`}>
          <div className="card-header">
            <FontAwesomeIcon icon={faTint} />
            <h3>Air Humidity</h3>
          </div>
          <div className="card-body">
            <div className="sensor-value">
              <span className="value">
                {sensorData?.air_humidity?.toFixed(1) || '--'}
              </span>
              <span className="unit">%</span>
            </div>
            <div className="sensor-info">
              <p>Optimal: 30-80%</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="system-info">
        <div className="info-card">
          <h3>Last Update</h3>
          <p className="timestamp">
            <FontAwesomeIcon icon={faClock} />
            {formatTimestamp(sensorData?.timestamp)}
          </p>
        </div>

        <div className="info-card">
          <h3>System Health</h3>
          <div className="health-indicators">
            <div className={`health-item ${systemStatus.isOnline ? 'good' : 'critical'}`}>
              <span className="health-label">Connection:</span>
              <span className="health-value">
                {systemStatus.isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="health-item good">
              <span className="health-label">Database:</span>
              <span className="health-value">Active</span>
            </div>
            <div className={`health-item ${sensorData ? 'good' : 'warning'}`}>
              <span className="health-label">Sensors:</span>
              <span className="health-value">
                {sensorData ? 'Reading' : 'No Data'}
              </span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>Auto Mode Info</h3>
          <div className="auto-info">
            <p><strong>Trigger:</strong> {settings.humidity_threshold}% humidity</p>
            <p><strong>Check Interval:</strong> Every hour</p>
            <p><strong>Schedule:</strong> Every {settings.scheduled_interval} hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;