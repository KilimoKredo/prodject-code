'use client';

import { useState, useEffect } from 'react';
import { ILoanApplication } from '@/lib/types';
import { Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge'; // Use the creditor's Badge component
import { Label } from '../ui/label';

interface Props {
  farmerId: string;
  refreshKey: boolean; // A key to trigger refetch
}

export function ApplicationHistory({ farmerId, refreshKey }: Props) {
  const [applications, setApplications] = useState<ILoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      try {
        // We pass the farmerId as a query param for our placeholder auth
        const response = await fetch(`/api/farmer/applications?farmerId=${farmerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch applications.');
        }
        const data = await response.json();
        setApplications(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [farmerId, refreshKey]); // Refetch when refreshKey changes

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
        My Loan Applications
      </h2>
      
      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="ml-3 text-gray-600">Loading your applications...</p>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {!loading && !error && applications.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          <p>You have not submitted any loan applications yet.</p>
          <p>Click the "Apply for Loan" tab to get started.</p>
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id as string} className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    Loan for {app.user.crop_type}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <Badge status={app.others.loanStatus} />
                </div>
              </div>
              <div className="border-t border-gray-100 my-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Amount Requested</Label>
                  <p className="font-medium text-gray-800">Ksh {app.others.loanAmountRequested.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Predicted Score</Label>
                  <p className="font-medium text-lg text-blue-600">{app.output.predictions.predicted_credict_score.toFixed(0)}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Model's Recommended Limit</Label>
                  <p className="font-medium text-gray-800">Ksh {app.output.predictions.predicted_loan_limit.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Model's Interest Rate</Label>
                  <p className="font-medium text-gray-800">{(app.output.predictions.predicted_interest_rate/100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
