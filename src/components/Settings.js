import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faUndo, 
  faTint,
  faClock,
  faPlay,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

function Settings({ settings, onUpdateSettings }) {
  const [formData, setFormData] = useState({
    humidity_threshold: settings.humidity_threshold || 30,
    watering_mode: settings.watering_mode || 'auto',
    scheduled_interval: settings.scheduled_interval || 12
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  // Save settings
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      await onUpdateSettings(formData);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Reset form to original settings
  const handleReset = () => {
    setFormData({
      humidity_threshold: settings.humidity_threshold || 30,
      watering_mode: settings.watering_mode || 'auto',
      scheduled_interval: settings.scheduled_interval || 12
    });
    setMessage(null);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>System Settings</h2>
        <p>Configure your smart plant watering system</p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`message ${message.type}`}>
          <p>{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="settings-form">
        {/* Humidity Threshold Section */}
        <div className="settings-section">
          <div className="section-header">
            <FontAwesomeIcon icon={faTint} />
            <h3>Soil Humidity Threshold</h3>
          </div>
          <div className="section-body">
            <div className="form-group">
              <label htmlFor="humidity_threshold">
                Watering Trigger Threshold (%)
              </label>
              <div className="input-group">
                <input
                  type="range"
                  id="humidity_threshold"
                  name="humidity_threshold"
                  min="10"
                  max="70"
                  value={formData.humidity_threshold}
                  onChange={handleChange}
                  className="range-input"
                />
                <span className="range-value">{formData.humidity_threshold}%</span>
              </div>
              <p className="help-text">
                <FontAwesomeIcon icon={faInfoCircle} />
                When soil humidity drops below this level, automatic watering will be triggered.
                Recommended: 25-40% for most plants.
              </p>
            </div>
          </div>
        </div>

        {/* Watering Mode Section */}
        <div className="settings-section">
          <div className="section-header">
            <FontAwesomeIcon icon={faPlay} />
            <h3>Watering Mode</h3>
          </div>
          <div className="section-body">
            <div className="form-group">
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="auto_mode"
                    name="watering_mode"
                    value="auto"
                    checked={formData.watering_mode === 'auto'}
                    onChange={handleChange}
                  />
                  <label htmlFor="auto_mode">
                    <strong>Automatic Mode</strong>
                    <span>Water automatically based on humidity threshold and schedule</span>
                  </label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="manual_mode"
                    name="watering_mode"
                    value="manual"
                    checked={formData.watering_mode === 'manual'}
                    onChange={handleChange}
                  />
                  <label htmlFor="manual_mode">
                    <strong>Manual Mode</strong>
                    <span>Only water when manually triggered from dashboard</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Watering Section */}
        <div className="settings-section">
          <div className="section-header">
            <FontAwesomeIcon icon={faClock} />
            <h3>Scheduled Watering</h3>
          </div>
          <div className="section-body">
            <div className="form-group">
              <label htmlFor="scheduled_interval">
                Watering Interval (hours)
              </label>
              <select
                id="scheduled_interval"
                name="scheduled_interval"
                value={formData.scheduled_interval}
                onChange={handleChange}
                disabled={formData.watering_mode === 'manual'}
              >
                <option value={6}>Every 6 hours</option>
                <option value={12}>Every 12 hours</option>
                <option value={24}>Once daily</option>
                <option value={48}>Every 2 days</option>
                <option value={72}>Every 3 days</option>
                <option value={168}>Weekly</option>
              </select>
              <p className="help-text">
                <FontAwesomeIcon icon={faInfoCircle} />
                {formData.watering_mode === 'manual' 
                  ? 'Scheduled watering is disabled in manual mode.'
                  : 'System will check if watering is needed at this interval. Actual watering depends on humidity threshold.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="settings-actions">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
            disabled={saving}
          >
            <FontAwesomeIcon icon={faUndo} /> Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            <FontAwesomeIcon icon={faSave} /> 
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Arduino Integration Info */}
      <div className="integration-info">
        <h3>Arduino Integration</h3>
        <div className="integration-details">
          <h4>API Endpoints for Arduino:</h4>
          <div className="endpoint">
            <code>POST /api/data</code>
            <p>Send sensor data: <code>{`{ "soil": 45.2, "temp": 23.1, "hum": 65.8, "pump": "off" }`}</code></p>
          </div>
          <div className="endpoint">
            <code>GET /api/latest</code>
            <p>Get current settings and system status</p>
          </div>
          <div className="endpoint">
            <code>POST /api/command</code>
            <p>Receive pump commands: <code>{`{ "pump": "on" }`}</code></p>
          </div>
          
          <h4>ESP8266 Example Code:</h4>
          <pre><code>{`// Send sensor data
HTTPClient http;
http.begin("http://your-server:5000/api/data");
http.addHeader("Content-Type", "application/json");
String payload = "{\\"soil\\":" + String(soilHumidity) + 
                 ",\\"temp\\":" + String(temperature) + 
                 ",\\"hum\\":" + String(airHumidity) + 
                 ",\\"pump\\":\\"off\\"}"; 
http.POST(payload);`}</code></pre>
        </div>
      </div>
    </div>
  );
}

export default Settings;