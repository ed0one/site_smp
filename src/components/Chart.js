import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

function Chart({ apiBaseUrl }) {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(24); // hours

  // Fetch historical data
  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBaseUrl}/api/history?hours=${timeRange}`);
      setHistoricalData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch historical data');
      console.error('Historical data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Process data for Chart.js
  const processChartData = () => {
    const labels = historicalData.map(item => 
      new Date(item.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        month: 'short',
        day: 'numeric'
      })
    );

    return {
      labels,
      datasets: [
        {
          label: 'Soil Humidity (%)',
          data: historicalData.map(item => item.soil_humidity),
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2ecc71',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Temperature (°C)',
          data: historicalData.map(item => item.temperature),
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#e74c3c',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y1'
        },
        {
          label: 'Air Humidity (%)',
          data: historicalData.map(item => item.air_humidity),
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#3498db',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#333',
          font: {
            size: 14,
            weight: '500'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: `Sensor Data - Last ${timeRange} Hours`,
        color: '#333',
        font: {
          size: 18,
          weight: '600'
        },
        padding: 20
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#2ecc71',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label === 'Temperature (°C)') {
                label += context.parsed.y.toFixed(1) + '°C';
              } else {
                label += context.parsed.y.toFixed(1) + '%';
              }
            }
            return label;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          color: '#666',
          font: {
            size: 14,
            weight: '500'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666',
          maxTicksLimit: 12
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Humidity (%)',
          color: '#666',
          font: {
            size: 14,
            weight: '500'
          }
        },
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: '#666',
          font: {
            size: 14,
            weight: '500'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#666'
        }
      }
    }
  };

  // Fetch data on component mount and time range change
  useEffect(() => {
    fetchHistoricalData();
  }, [timeRange]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHistoricalData();
    }, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Sensor History</h2>
        <div className="time-range-controls">
          <label htmlFor="time-range">Time Range:</label>
          <select 
            id="time-range" 
            value={timeRange} 
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
          >
            <option value={1}>Last Hour</option>
            <option value={6}>Last 6 Hours</option>
            <option value={12}>Last 12 Hours</option>
            <option value={24}>Last 24 Hours</option>
            <option value={48}>Last 2 Days</option>
            <option value={168}>Last Week</option>
          </select>
          <button onClick={fetchHistoricalData} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="chart-error">
          <p>{error}</p>
          <button onClick={fetchHistoricalData}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="chart-loading">
          <div className="spinner"></div>
          <p>Loading historical data...</p>
        </div>
      ) : historicalData.length === 0 ? (
        <div className="no-data">
          <p>No historical data available for the selected time range.</p>
          <p>Data will appear here once the Arduino starts sending sensor readings.</p>
        </div>
      ) : (
        <div className="chart-wrapper">
          <Line data={processChartData()} options={chartOptions} />
        </div>
      )}

      {/* Data Summary */}
      {historicalData.length > 0 && (
        <div className="data-summary">
          <h3>Summary (Last {timeRange} hours)</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <h4>Soil Humidity</h4>
              <p><strong>Average:</strong> {(historicalData.reduce((sum, item) => sum + item.soil_humidity, 0) / historicalData.length).toFixed(1)}%</p>
              <p><strong>Min:</strong> {Math.min(...historicalData.map(item => item.soil_humidity)).toFixed(1)}%</p>
              <p><strong>Max:</strong> {Math.max(...historicalData.map(item => item.soil_humidity)).toFixed(1)}%</p>
            </div>
            
            <div className="summary-card">
              <h4>Temperature</h4>
              <p><strong>Average:</strong> {(historicalData.reduce((sum, item) => sum + item.temperature, 0) / historicalData.length).toFixed(1)}°C</p>
              <p><strong>Min:</strong> {Math.min(...historicalData.map(item => item.temperature)).toFixed(1)}°C</p>
              <p><strong>Max:</strong> {Math.max(...historicalData.map(item => item.temperature)).toFixed(1)}°C</p>
            </div>
            
            <div className="summary-card">
              <h4>Air Humidity</h4>
              <p><strong>Average:</strong> {(historicalData.reduce((sum, item) => sum + item.air_humidity, 0) / historicalData.length).toFixed(1)}%</p>
              <p><strong>Min:</strong> {Math.min(...historicalData.map(item => item.air_humidity)).toFixed(1)}%</p>
              <p><strong>Max:</strong> {Math.max(...historicalData.map(item => item.air_humidity)).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chart;