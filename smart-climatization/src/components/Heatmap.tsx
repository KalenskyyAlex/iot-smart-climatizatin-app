import React from 'react';
import { getTemperatureColor } from '../utils/temperature'; // Using the getTemperatureColor function
import type { HeatmapProps } from '../types';

const Heatmap: React.FC<HeatmapProps> = ({ temperatures }) => {
  // Ensure we have valid data to avoid errors
  if (!temperatures || temperatures.length !== 6) {
    return <div className="text-red-500">Invalid or missing temperature data.</div>;
  }

  // Safely access temperature values and apply the getTemperatureColor function
  const safeTemperatures = temperatures.map((temp) => 
    (temp && typeof temp.value === 'number' && !isNaN(temp.value)) ? temp.value : 20
  );

  return (
    <div className="w-full mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Room Temperature Heatmap</h3>
      <div className="aspect-[3/2] w-full rounded-lg overflow-hidden relative">
        {/* Background gradient layer */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(100% 50% at 16.67% 25%, ${getTemperatureColor(safeTemperatures[0])} 0%, transparent 70%),
              radial-gradient(100% 50% at 50% 25%, ${getTemperatureColor(safeTemperatures[1])} 0%, transparent 70%),
              radial-gradient(100% 50% at 83.33% 25%, ${getTemperatureColor(safeTemperatures[2])} 0%, transparent 70%),
              radial-gradient(100% 50% at 16.67% 75%, ${getTemperatureColor(safeTemperatures[3])} 0%, transparent 70%),
              radial-gradient(100% 50% at 50% 75%, ${getTemperatureColor(safeTemperatures[4])} 0%, transparent 70%),
              radial-gradient(100% 50% at 83.33% 75%, ${getTemperatureColor(safeTemperatures[5])} 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />

        {/* Overlay layer for better color blending */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(70% 35% at 16.67% 25%, ${getTemperatureColor(safeTemperatures[0])}80 0%, transparent 100%),
              radial-gradient(70% 35% at 50% 25%, ${getTemperatureColor(safeTemperatures[1])}80 0%, transparent 100%),
              radial-gradient(70% 35% at 83.33% 25%, ${getTemperatureColor(safeTemperatures[2])}80 0%, transparent 100%),
              radial-gradient(70% 35% at 16.67% 75%, ${getTemperatureColor(safeTemperatures[3])}80 0%, transparent 100%),
              radial-gradient(70% 35% at 50% 75%, ${getTemperatureColor(safeTemperatures[4])}80 0%, transparent 100%),
              radial-gradient(70% 35% at 83.33% 75%, ${getTemperatureColor(safeTemperatures[5])}80 0%, transparent 100%)`,
            mixBlendMode: 'multiply',
          }}
        />

        {/* Room outline */}
        <div className="absolute inset-0 border-2 border-gray-200 rounded-lg" />
      </div>

      {/* Temperature scale */}
      <div className="mt-2">
        <div className="w-full h-2 rounded-full" style={{
          background: 'linear-gradient(to right, #0066cc, #4d94ff, #ffff99, #ff944d, #cc3300)'
        }} />
        <div className="flex justify-between mt-1 text-sm text-gray-600">
          <span>10°C</span>
          <span>20°C</span>
          <span>35°C</span>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
