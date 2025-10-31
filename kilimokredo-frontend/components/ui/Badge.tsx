import React from 'react';

type Status = 'Approved' | 'Pending' | 'Rejected';

interface Props {
  status: Status;
}

export const Badge: React.FC<Props> = ({ status }) => {
  const colorClasses = {
    Approved: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${colorClasses[status]}`}
    >
      {status}
    </span>
  );
};