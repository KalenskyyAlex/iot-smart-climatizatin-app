import React from 'react';
import { Thermometer } from 'lucide-react';
import { getTemperatureColor } from '../utils/temperature'; // Importing the function

interface TemperatureCellProps {
  temperature: number;
  id: number;
}

const TemperatureCell: React.FC<TemperatureCellProps> = ({ temperature, id }) => {
  const backgroundColor = getTemperatureColor(temperature);  // Get the color based on temperature

  return (
    <div
      className="p-4 rounded-lg shadow-md flex flex-col items-center justify-center gap-2 relative"
      style={{ backgroundColor }}
    >
      {/* Optional overlay with semi-transparent background */}
      <div className="absolute inset-0 bg-black/20 rounded-lg" />

      <Thermometer className="w-8 h-8 text-white relative z-10" aria-label="Thermometer icon" />

      <div className="text-white font-bold relative z-10">
        <span>Sensor {id}</span>
        <div>{temperature.toFixed(1)}°C</div> {/* Temperature value displayed here */}
      </div>
    </div>
  );
};

export default TemperatureCell;
