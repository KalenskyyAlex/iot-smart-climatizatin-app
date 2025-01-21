export interface TemperatureData {
  id: number;
  value: number;
}

export interface HeatmapProps {
  temperatures: TemperatureData[];
}