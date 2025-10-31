import { Suspense } from 'react';
import { StatCard }  from '@/components/dashboard/StatCard';
import { ILoanApplication } from '@/lib/types';
import { ApplicationTable } from '@/components/dashboard/ApplicationTable';

// Helper function to fetch data
async function getApplications(): Promise<ILoanApplication[]> {
  // This fetch call is for our *own* API route.
  // In a server component, this needs to be an absolute URL.
  // In production, use an environment variable for the base URL.
  const res = await fetch('http://localhost:3000/api/applications', {
    cache: 'no-store', // We want fresh data
  });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export default async function DashboardPage() {
  const applications = await getApplications();

  const pendingCount = applications.filter(
    (app) => app.others.loanStatus === 'Pending'
  ).length;
  const approvedCount = applications.filter(
    (app) => app.others.loanStatus === 'Approved'
  ).length;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Creditor Dashboard
      </h1>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Applications" value={applications.length} />
        <StatCard title="Pending Review" value={pendingCount} />
        <StatCard title="Total Approved" value={approvedCount} />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <Suspense fallback={<p>Loading applications...</p>}>
          <ApplicationTable applications={applications} />
        </Suspense>
      </div>
    </div>
  );
}