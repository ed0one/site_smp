import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTint, 
  faThermometerHalf, 
  faWater, 
  faCog, 
  faPowerOff,
  faPlay,
  faStop,
  faMoon,
  faSun,
  faLeaf
} from '@fortawesome/free-solid-svg-icons';
import PlantCareIcon from './components/PlantCareIcon';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Chart from './components/Chart';
import './App.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'http://172.20.10.2:5001';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [systemStatus, setSystemStatus] = useState({
    isOnline: false,
    pumpStatus: 'off',
    currentMode: 'auto'
  });
  const [settings, setSettings] = useState({
    humidity_threshold: 30,
    watering_mode: 'auto',
    scheduled_interval: 12
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch latest data from API
  const fetchLatestData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/latest`);
      setSensorData(response.data.sensorData);
      setSystemStatus(response.data.systemStatus);
      setSettings(response.data.settings);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data from server');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send pump command
  const sendPumpCommand = async (command) => {
    try {
      await axios.post(`${API_BASE_URL}/api/command`, { pump: command });
      await fetchLatestData(); // Refresh data after command
    } catch (err) {
      setError('Failed to send pump command');
      console.error('Command Error:', err);
    }
  };

  // Change watering mode
  const changeWateringMode = async (mode) => {
    try {
      await axios.post(`${API_BASE_URL}/api/command`, { mode });
      await axios.put(`${API_BASE_URL}/api/settings`, { watering_mode: mode });
      await fetchLatestData();
    } catch (err) {
      setError('Failed to change watering mode');
      console.error('Mode Change Error:', err);
    }
  };

  // Update settings
  const updateSettings = async (newSettings) => {
    try {
      await axios.put(`${API_BASE_URL}/api/settings`, newSettings);
      await fetchLatestData();
    } catch (err) {
      setError('Failed to update settings');
      console.error('Settings Error:', err);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Fetch data on component mount and every 10 seconds
  useEffect(() => {
    fetchLatestData();
    const interval = setInterval(fetchLatestData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <PlantCareIcon size="48" className="spin" />
          <p>Loading PlantCare System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {/* Navigation Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <PlantCareIcon size="32" />
            <h1>PlantCare</h1>
          </div>
        </div>
        
        <div className="header-center">
          <nav className="nav-tabs">
            <button 
              className={currentView === 'dashboard' ? 'active' : ''}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={currentView === 'chart' ? 'active' : ''}
              onClick={() => setCurrentView('chart')}
            >
              History
            </button>
            <button 
              className={currentView === 'settings' ? 'active' : ''}
              onClick={() => setCurrentView('settings')}
            >
              <FontAwesomeIcon icon={faCog} /> Settings
            </button>
          </nav>
        </div>

        <div className="header-right">
          <div className="system-status">
            <span className={`status-indicator ${systemStatus.isOnline ? 'online' : 'offline'}`}>
              {systemStatus.isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Main Content */}
      <main className="app-main">
        {currentView === 'dashboard' && (
          <Dashboard
            sensorData={sensorData}
            systemStatus={systemStatus}
            settings={settings}
            onPumpCommand={sendPumpCommand}
            onModeChange={changeWateringMode}
            formatTimestamp={formatTimestamp}
          />
        )}
        
        {currentView === 'chart' && (
          <Chart apiBaseUrl={API_BASE_URL} />
        )}
        
        {currentView === 'settings' && (
          <Settings
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>PlantCare Monitoring System - Smart Plant Care Made Simple</p>
      </footer>
    </div>
  );
}

export default App;
