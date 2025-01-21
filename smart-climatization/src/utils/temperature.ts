import { scaleLinear } from 'd3-scale';

// Function to return the color based on temperature
export const getTemperatureColor = (temperature: number): string => {
  const colorScale = scaleLinear<string>()
    .domain([10, 15, 20, 25, 30, 35])  // Temperature range from 10°C to 35°C
    .range(['#0066cc', '#4d94ff', '#ffff99', '#ff944d', '#cc3300']);  // Blue -> Light Blue -> Yellow -> Orange -> Red

  return colorScale(temperature);
};

// Function to generate random temperatures within the desired range
export const getRandomTemperature = (): number => {
  return Math.floor(Math.random() * (35 - 10 + 1)) + 10;  // Random temperature between 10°C and 35°C
};
