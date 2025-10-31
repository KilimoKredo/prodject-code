import { ModelFeatures } from '@/lib/types';
import { StatCard } from './StatCard';
import { Sun, CloudRain, Leaf } from 'lucide-react';

interface Props {
  features: ModelFeatures;
}

/**
 * A simple component that displays the weather and agronomy data
 * that was fetched when the loan application was created.
 */
export function AgronomyData({ features }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <StatCard
        title="Avg. NDVI (Crop Health)"
        value={features.NDVI.toFixed(3)}
        description="Satellite measure of vegetation greenness. Higher is generally better."
      />
      <StatCard
        title="Avg. Daily Rainfall (mm)"
        value={features.avg_rainfall.toFixed(2)}
        description="6-month average daily precipitation at the farm's location."
      />
      <StatCard
        title="Avg. Temperature (°C)"
        value={features.avg_temp.toFixed(1)}
        description="6-month average daily temperature at the farm's location."
      />
      <StatCard
        title="Rainfall / Temp Interaction"
        value={features.temp_x_rainfall.toFixed(2)}
        description="A feature engineered by the model to capture climate interactions."
      />
    </div>
  );
}

