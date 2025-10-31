interface Props {
  title: string;
  value: string | number;
  description?: string;
}

export const StatCard: React.FC<Props> = ({ title, value, description }) => (
  <div className="bg-white p-4 rounded-lg shadow-lg">
    <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
    <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    {description && (
      <p className="mt-1 text-xs text-gray-600">{description}</p>
    )}
  </div>
);