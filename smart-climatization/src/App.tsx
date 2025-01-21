import { useState, useEffect, useCallback } from 'react';
import { Power, WifiOff } from 'lucide-react';
import TemperatureCell from './components/TemperatureCell';
import Heatmap from './components/Heatmap';
import type { TemperatureData } from './types';

const API_URL = 'http://localhost:3001/api/heatmap'; 
const AC_CONTROL_URL = 'http://localhost:3001/api/ac-control';
const AC_TEMP_URL = 'http://localhost:3001/api/ac-temp';

const TEMPERATURE_THRESHOLD = 5;

function App() {
  const [temperatures, setTemperatures] = useState<TemperatureData[]>([]);
  const [isACOn, setIsACOn] = useState(false);
  const [previousAvgTemp, setPreviousAvgTemp] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [desiredTemp, setDesiredTemp] = useState(22); // Default desired temperature

  const fetchTemperatures = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch temperatures');
      const data = await response.json();
      console.log('Fetched temperatures:', data);

      if (Array.isArray(data) && data.length === 2 && data.every(row => row.length === 3)) {
        const flattenedData = data.flat().map((value, index) => ({
          id: index + 1,
          value,
        }));
        setTemperatures(flattenedData);
      } else {
        throw new Error('Invalid heatmap data format');
      }
      setConnectionError(null);
    } catch (error) {
      console.error('API fetch error:', error);
      setConnectionError('Failed to fetch temperature data');
      setTemperatures([
        { id: 1, value: 20 },
        { id: 2, value: 20 },
        { id: 3, value: 20 },
        { id: 4, value: 20 },
        { id: 5, value: 20 },
        { id: 6, value: 20 },
      ]);
    }
  };

  useEffect(() => {
    fetchTemperatures();
    const intervalId = setInterval(fetchTemperatures, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (temperatures.length > 0) {
      const currentAvgTemp =
        temperatures.reduce((sum, t) => sum + t.value, 0) / temperatures.length;
      if (previousAvgTemp !== null) {
        const tempDiff = Math.abs(currentAvgTemp - previousAvgTemp);
        if (tempDiff >= TEMPERATURE_THRESHOLD) {
          if (isACOn) {
            handleACToggle();
          }
        }
      }
      setPreviousAvgTemp(currentAvgTemp);
    }
  }, [temperatures]);

  const fetchACStatus = async () => {
    try {
      const response = await fetch(AC_CONTROL_URL);
      if (!response.ok) throw new Error('Failed to fetch AC status');
      const data = await response.json();

      if (data.ac_status === 'on') {
        setIsACOn(true);
      } else if (data.ac_status === 'off') {
        setIsACOn(false);
      }
    } catch (error) {
      console.error('API fetch AC status error:', error);
      setConnectionError('Failed to fetch AC status');
    }
  };

  useEffect(() => {
    fetchACStatus();
    const intervalId = setInterval(fetchACStatus, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleACToggle = useCallback(async () => {
    try {
      const newState = !isACOn;
      const response = await fetch(AC_CONTROL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ac_status: newState ? 'on' : 'off' }),
      });

      if (!response.ok) throw new Error('Failed to toggle AC');
      setIsACOn(newState);
    } catch (error) {
      console.error('API toggle AC error:', error);
      setConnectionError('Failed to toggle AC');
    }
  }, [isACOn]);

  const handleSliderChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTemp = parseInt(event.target.value);
    setDesiredTemp(newTemp);
  
    try {
      const response = await fetch(AC_TEMP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desired_temp: newTemp }),
      });
  
      if (!response.ok) throw new Error('Failed to update desired temperature');
      console.log(`Desired temperature set to ${newTemp}°C`);
    } catch (error) {
      console.error('API set temperature error:', error);
      setConnectionError('Failed to update desired temperature');
    }
  }, []);

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600">{connectionError}</p>
          <p className="text-sm text-gray-500 mt-4">
            Please check your API configuration and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Temperature Monitoring System</h1>
          <div className="text-sm text-gray-600">
            {connectionError ? (
              <span className="text-red-600">Connection Error</span>
            ) : (
              <span className="text-green-600">Connected to API</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {temperatures.map((temp) => (
            <TemperatureCell key={temp.id} temperature={temp.value} id={temp.id} />
          ))}
        </div>

        <Heatmap temperatures={temperatures} />

        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Set Desired Temperature</h2>
          <input
            type="range"
            min="10"
            max="30"
            value={desiredTemp}
            onChange={handleSliderChange}
            className="w-full"
          />
          <p className="mt-2 text-gray-700 text-center">
            Desired Temperature: <span className="font-bold">{desiredTemp}°C</span>
          </p>
        </div>

        <button
          onClick={handleACToggle}
          disabled={connectionError !== null}  
          className={`mt-6 w-full py-2 text-white rounded-md ${
            isACOn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } flex items-center justify-center`}
        >
          <Power className="w-6 h-6 mr-2" />
          {isACOn ? 'Turn AC Off' : 'Turn AC On'}
        </button>
      </div>
    </div>
  );
}

export default App;
