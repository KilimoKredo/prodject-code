'use client';

import { useState, useEffect } from 'react';
import { FarmerInput, ModelFeatures, ModelPredictions } from '@/lib/types';
import { StatCard } from './StatCard'; // Re-using this component
import { Loader2 } from 'lucide-react'; // Import loader

// A simple loading spinner
const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

// A reusable slider component
interface SliderProps {
  label: string;
  id: keyof WhatIfFormData;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  format?: 'number' | 'currency' | 'decimal' | 'percent';
}

const WhatIfSlider: React.FC<SliderProps> = ({
  label, id, min, max, step, value, onChange, format = 'number'
}) => {
  let displayValue: string;
  const numValue = value || 0; // FIX: Fallback for null or undefined

  switch (format) {
    case 'currency':
      displayValue = `Ksh ${numValue.toLocaleString()}`;
      break;
    case 'decimal':
      displayValue = numValue.toFixed(2);
      break;
    case 'percent':
      displayValue = `${(numValue * 100).toFixed(0)}%`;
      break;
    default:
      displayValue = numValue.toString();
  }

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="range"
        id={id}
        name={id}
        min={min}
        max={max}
        step={step}
        value={numValue} // Use fallback
        onChange={onChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="text-right text-gray-600 font-medium">
        {displayValue}
      </div>
    </div>
  );
};

// This is the state for our 4 new sliders
interface WhatIfFormData {
  price_of_crop: number;
  avg_rainfall: number;
  avg_temp: number;
  NDVI: number;
}

interface SimulatorProps {
  initialData: FarmerInput;   // <-- FIX: Renamed from originalInputs
  initialFeatures: ModelFeatures; // The full feature list the model used
}

export function WhatIfSimulator({ initialData, initialFeatures }: SimulatorProps) { // <-- FIX: Renamed
  
  // FIX 1: Initialize state as null
  const [formData, setFormData] = useState<WhatIfFormData | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [newPrediction, setNewPrediction] = useState<ModelPredictions | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // FIX 2: Use useEffect to set state only when initialFeatures is ready
  useEffect(() => {
    if (initialFeatures) {
      setFormData({
        price_of_crop: initialFeatures.price_of_crop,
        avg_rainfall: initialFeatures.avg_rainfall,
        avg_temp: initialFeatures.avg_temp,
        NDVI: initialFeatures.NDVI,
      });
    }
  }, [initialFeatures]); // This runs when initialFeatures is populated

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPrediction(null); // Clear old prediction on new change
    setFormData((prev) => ({
      ...(prev as WhatIfFormData), // Cast as non-null
      [name]: Number(value),
    }));
  };

  const handleSubmit = async () => {
    if (!formData || !initialData) return; // <-- FIX: Added safety check for initialData

    setIsLoading(true);
    setNewPrediction(null);
    setError(null);

    // --- This is the key logic ---
    // 1. Start with the farmer's *original* inputs
    const simulationPayload = { ...initialData }; // <-- FIX: Renamed

    // 2. Overwrite/add the new "what-if" values
    (simulationPayload as any).price_of_crop = formData.price_of_crop;
    (simulationPayload as any).avg_rainfall = formData.avg_rainfall;
    (simulationPayload as any).avg_temp = formData.avg_temp;
    (simulationPayload as any).NDVI = formData.NDVI;
    
    // 3. Recalculate total_yield_ksh based on new price_of_crop
    (simulationPayload as any).total_yield_ksh = 
      initialData.farm_size_sqm * formData.price_of_crop * initialData.crop_yield_per_sqm; // <-- FIX: Renamed
    // --- End logic ---

    try {
      // Send the *full* modified object to our backend
      const res = await fetch('/api/inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simulationPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to run simulation.');
      }

      const result = await res.json();
      if (result.error) {
        throw new Error(result.error);
      }
      
      setNewPrediction(result.predictions);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // FIX 3: Show a loading state until formData AND initialData is initialized
  if (!formData || !initialData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Loading simulator...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        <WhatIfSlider
          label="Price of Crop (Ksh)"
          id="price_of_crop"
          min={0}
          max={1000} // FIX 4: Dynamic max
          step={1}
          value={formData.price_of_crop}
          onChange={handleSliderChange}
          format="currency"
        />
        <WhatIfSlider
          label="Avg. Daily Rainfall (mm)"
          id="avg_rainfall"
          min={0}
          max={10} // FIX 4: Dynamic max
          step={0.1}
          value={formData.avg_rainfall}
          onChange={handleSliderChange}
          format="decimal"
        />
        <WhatIfSlider
          label="Avg. Temperature (°C)"
          id="avg_temp"
          min={10}
          max={40} // FIX 4: Dynamic max
          step={0.1}
          value={formData.avg_temp}
          onChange={handleSliderChange}
          format="decimal"
        />
        <WhatIfSlider
          label="Avg. NDVI (Crop Health)"
          id="NDVI"
          min={0}
          max={1.0}
          step={0.01}
          value={formData.NDVI}
          onChange={handleSliderChange}
          format="decimal"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full h-12 px-6 text-white font-semibold bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 flex items-center justify-center"
      >
        {isLoading ? <Spinner /> : 'Rerun Simulation'}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {newPrediction && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h3 className="text-lg font-semibold text-blue-800">
            New Predicted Outcome
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <StatCard
              title="New Credit Score"
              value={newPrediction.predicted_credict_score.toFixed(0)}
            />
            <StatCard
              title="New Loan Limit (Ksh)"
              value={Math.round(newPrediction.predicted_loan_limit).toLocaleString()}
            />
            <StatCard
              title="New Interest Rate"
              value={`${(newPrediction.predicted_interest_rate/100).toFixed(2)}%`}
            />
            <StatCard
              title="New Loan Duration"
              value={`${Math.round((newPrediction.predicted_loan_duration)/30)} months`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

