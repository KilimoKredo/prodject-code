'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { IFarmer, FarmerInput, ILoanApplication } from '@/lib/types'; // Import types
import { StaticFarmMap } from '../staticFarmMap';

// This is your Farmer type from local storage
interface Farmer extends IFarmer {
  _id: string;
}

interface Props {
  farmer: Farmer;
  onApplicationSubmit: (newApplication: ILoanApplication) => void;
}

const ACRE_TO_SQM = 4046.86;

export function LoanApplicationForm({ farmer, onApplicationSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    crop_type: '',
    price_of_crop: '',
    crop_yield_per_sqm: '',
    previous_loans_count: '',
    defaulted_loans_count: '',
    seasonal_expense: '',
    loanAmountRequested: '',
  });
  
  const [calculatedYield, setCalculatedYield] = useState(0);

  // Pre-filled data from farmer's profile
  const farm_size_sqm = farmer.farmSize;
  const location = `"${farmer.farmLocation.lat},${farmer.farmLocation.lng}"`;

  // Live calculation of total_yield_ksh
  useEffect(() => {
    const price = parseFloat(formData.price_of_crop) || 0;
    const yieldPerSqm = parseFloat(formData.crop_yield_per_sqm) || 0;
    const totalYield = farm_size_sqm * price * yieldPerSqm;
    setCalculatedYield(totalYield);
  }, [formData.price_of_crop, formData.crop_yield_per_sqm, farm_size_sqm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Form Validation ---
    const requiredFields: (keyof typeof formData)[] = [
      'crop_type', 'price_of_crop', 'crop_yield_per_sqm', 
      'previous_loans_count', 'defaulted_loans_count', 
      'seasonal_expense', 'loanAmountRequested'
    ];
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setError(`Please fill in ${field.replace('_', ' ')}.`);
        return;
      }
    }
    
    setLoading(true);

    // --- Prepare Data for API ---
    const applicationData: FarmerInput = {
      location: location,
      farm_size_sqm: farm_size_sqm,
      total_yield_ksh: calculatedYield,
      crop_type: formData.crop_type,
      price_of_crop: parseFloat(formData.price_of_crop),
      crop_yield_per_sqm: parseFloat(formData.crop_yield_per_sqm),
      previous_loans_count: parseInt(formData.previous_loans_count, 10),
      defaulted_loans_count: parseInt(formData.defaulted_loans_count, 10),
      seasonal_expense: parseFloat(formData.seasonal_expense),
    };

    try {
      const response = await fetch('/api/farmer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationData: applicationData,
          loanAmountRequested: parseFloat(formData.loanAmountRequested),
          farmerId: farmer._id, // Pass farmerId (as auth is placeholder)
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Application failed to submit.');
      }

      setSuccess('Your application has been submitted successfully! You can track its status in the "My Applications" tab.');
      // Clear form
      setFormData({
        crop_type: '', price_of_crop: '', crop_yield_per_sqm: '',
        previous_loans_count: '', defaulted_loans_count: '',
        seasonal_expense: '', loanAmountRequested: '',
      });
      
      // Notify the parent page to switch tabs
      onApplicationSubmit(result);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
        New Loan Application
      </h2>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Pre-filled Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Label className="text-gray-500 text-xs">Farm Location (Lat, Lng)</Label>
          {/* <p className="font-medium text-gray-800">{location.replace(/"/g, '')}</p> */}
           <StaticFarmMap locationString={location} height="200px" />
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Label className="text-gray-500 text-xs">Farm Size (sqm)</Label>
          <p className="font-medium text-gray-800">{farm_size_sqm.toFixed(2)}</p>
        </div>
      </div>

      {/* User Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="crop_type">Primary Crop Type</Label>
          <Input id="crop_type" name="crop_type" placeholder="e.g., Maize, Tea, Coffee" value={formData.crop_type} onChange={handleInputChange} disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="loanAmountRequested">Loan Amount Requested (Ksh)</Label>
          <Input id="loanAmountRequested" name="loanAmountRequested" type="number" placeholder="e.g., 50000" value={formData.loanAmountRequested} onChange={handleInputChange} disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_of_crop">Avg. Price of Crop (Ksh per unit)</Label>
          <Input id="price_of_crop" name="price_of_crop" type="number" placeholder="e.g., 55" value={formData.price_of_crop} onChange={handleInputChange} disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="crop_yield_per_sqm">Avg. Crop Yield (units per sqm)</Label>
          <Input id="crop_yield_per_sqm" name="crop_yield_per_sqm" type="number" step="0.01" placeholder="e.g., 0.63" value={formData.crop_yield_per_sqm} onChange={handleInputChange} disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seasonal_expense">Est. Seasonal Expense (Ksh)</Label>
          <Input id="seasonal_expense" name="seasonal_expense" type="number" placeholder="e.g., 55500" value={formData.seasonal_expense} onChange={handleInputChange} disabled={loading} />
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 col-span-1 md:col-span-2">
          <Label className="text-blue-600 text-xs">Calculated Total Yield (Ksh)</Label>
          <p className="text-2xl font-bold text-blue-800">
            {calculatedYield.toLocaleString('en-US', { style: 'currency', currency: 'KSH' })}
          </p>
          <p className="text-xs text-gray-600">(Farm Size × Price × Yield per sqm)</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="previous_loans_count">Previous Loans Count</Label>
          <Input id="previous_loans_count" name="previous_loans_count" type="number" placeholder="e.g., 4" value={formData.previous_loans_count} onChange={handleInputChange} disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaulted_loans_count">Defaulted Loans Count</Label>
          <Input id="defaulted_loans_count" name="defaulted_loans_count" type="number" placeholder="e.g., 1" value={formData.defaulted_loans_count} onChange={handleInputChange} disabled={loading} />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 text-lg">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
      </Button>
    </form>
  );
}
