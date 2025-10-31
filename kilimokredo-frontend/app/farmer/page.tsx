'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, FileText, History } from 'lucide-react';
import { IFarmer, ILoanApplication } from '@/lib/types'; // Import ILoanApplication
import { LoanApplicationForm } from '@/components/farmer/LoanApplicationForm';
import { ApplicationHistory } from '@/components/farmer/ApplicationHistory';

// Your Farmer type from SignUp
interface Farmer extends IFarmer {
  _id: string; 
}

type Tab = 'apply' | 'history';

export default function Dashboard() {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('apply');
  
  // This state is for refreshing the history list after a new submission
  const [refreshApplications, setRefreshApplications] = useState(false);

  useEffect(() => {
    const farmerData = localStorage.getItem('farmer');
    if (farmerData) {
      try {
        setFarmer(JSON.parse(farmerData));
      } catch (e) {
        console.error('Failed to parse farmer data', e);
        handleLogout(); // Corrupted data, log out
      }
    } else {
      // No farmer data, redirect to login
      window.location.href = '/'; 
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('farmer');
    window.location.href = '/';
  };

  const handleApplicationSubmit = (newApplication: ILoanApplication) => {
    // Switch to the history tab to show the new "Pending" app
    setActiveTab('history');
    // Trigger the history component to refetch
    setRefreshApplications(prev => !prev);
  }

  if (loading || !farmer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  console.log("farmer:", farmer);
  

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-green-700">
            Welcome, {farmer.farmerName}!
          </h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 bg-transparent text-gray-700 hover:text-black"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            onClick={() => setActiveTab('apply')}
            className={`flex items-center gap-2 px-4 py-3 text-lg font-medium border-b-2 ${
              activeTab === 'apply'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="w-5 h-5" />
            Apply for Loan
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-3 text-lg font-medium border-b-2 ${
              activeTab === 'history'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <History className="w-5 h-5" />
            My Applications
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {activeTab === 'apply' ? (
            <LoanApplicationForm
              farmer={farmer} 
              onApplicationSubmit={handleApplicationSubmit}
            />
          ) : (
            <ApplicationHistory
              farmerId={farmer._id} 
              refreshKey={refreshApplications}
            />
          )}
        </div>
      </div>
    </main>
  );
}
