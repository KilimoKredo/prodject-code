'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui
import { Check, X, Loader2 } from 'lucide-react';
import { ILoanApplication } from '@/lib/types';

interface Props {
  applicationId: any;
  currentStatus: any;
}

export function ApplicationActions({ applicationId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter(); // We'll use this to refresh the page data

  const handleUpdateStatus = async (newStatus: 'Approved' | 'Rejected') => {
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update status');
      }

      const updatedApplication: ILoanApplication = await res.json();
      setStatus(updatedApplication.others.loanStatus);
      
      // CRITICAL: This re-fetches the server-side data,
      // which will update the <Badge /> on the main page.
      router.refresh(); 

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // If the loan is already decided, just show the status.
  if (status !== 'Pending') {
    return (
      <div
        className={`p-4 rounded-lg text-center font-semibold text-lg ${
          status === 'Approved'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        This loan has been {status}.
      </div>
    );
  }

  // If it's pending, show the action buttons.
  return (
    <div className="space-y-1 w-full">
      <div className="grid grid-cols-2 gap-4">
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold text-base py-6"
          disabled={isLoading}
          onClick={() => handleUpdateStatus('Approved')}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Check className="w-5 h-5 mr-2" />
          )}
          Approve Loan
        </Button>
        <Button
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold text-base py-6"
          disabled={isLoading}
          onClick={() => handleUpdateStatus('Rejected')}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <X className="w-5 h-5 mr-2" />
          )}
          Reject Loan
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
