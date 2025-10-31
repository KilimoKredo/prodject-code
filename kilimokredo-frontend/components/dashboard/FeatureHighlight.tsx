import { ModelFeatures } from '@/lib/types';
import { StatCard } from './StatCard';

interface Props {
  features: ModelFeatures;
}

export function FeatureHighlight({ features }: Props) {
  return (
    <div className="space-y-4">
      <StatCard
        title="Net Income (Ksh)"
        value={Math.round(features.net_income).toLocaleString()}
        description="Total Yield minus Seasonal Expense. A key driver of profitability."
      />
      <StatCard
        title="Profit Margin"
        value={`${(features.profit_margin * 100).toFixed(1)}%`}
        description="How much profit is made per shilling of yield. Higher is better."
      />
      <StatCard
        title="Default Rate"
        value={`${(features.default_rate * 100).toFixed(1)}%`}
        description="Past defaults vs. total loans. The strongest predictor of future risk."
      />
      <StatCard
        title="Yield Value (per sqm)"
        value={`Ksh ${features.yield_value_per_sqm.toFixed(2)}`}
        description="A measure of farm efficiency and value."
      />
      <StatCard
        title="NDVI (Greenness)"
        value={features.NDVI.toFixed(3)}
        description="Satellite measure of crop health."
      />
    </div>
  );
}