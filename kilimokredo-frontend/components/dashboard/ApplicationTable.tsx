'use client';

import { useState } from 'react';
import { ILoanApplication } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '../ui/Badge';

interface Props {
  applications: ILoanApplication[];
}

export function ApplicationTable({ applications }: Props) {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>(
    'All'
  );

  const filteredApps = applications.filter((app) => {
    if (filter === 'All') return true;
    return app.others.loanStatus === filter;
  });

  return (
    <div>
      <div className="p-4 flex space-x-2 border-b border-gray-200">
        {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Crop Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount Requested
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Predicted Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredApps.map((app) => (
            <tr key={app._id as string} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {new Date(Date.now()).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {app.user.crop_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                Ksh {app.others.loanAmountRequested.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {app.output.predictions.predicted_credict_score.toFixed(0)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge status={app.others.loanStatus} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  href={`/dashboard/application/${app._id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Review
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}