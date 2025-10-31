interface Props {
  score: number;
}

// A simple gauge component
export const PredictionGauge: React.FC<Props> = ({ score }) => {
  // Assuming a score range of 300-850
  const minScore = 300;
  const maxScore = 850;
  const percentage = ((score - minScore) / (maxScore - minScore)) * 100;

  let color = 'bg-green-500';
  if (percentage < 40) {
    color = 'bg-red-500';
  } else if (percentage < 70) {
    color = 'bg-yellow-500';
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg text-center">
      <h3 className="text-sm font-medium text-gray-500">Credit Score</h3>
      <p className="mt-1 text-5xl font-bold text-gray-900">
        {Math.round(score)}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div
          className={`${color} h-2.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};