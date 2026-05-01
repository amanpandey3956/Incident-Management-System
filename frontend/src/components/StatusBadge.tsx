import React from 'react';

const statusStyles: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-800',
  INVESTIGATING: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-600',
};

const priorityStyles: Record<string, string> = {
  P0: 'bg-red-100 text-red-800',
  P1: 'bg-yellow-100 text-yellow-800',
  P2: 'bg-green-100 text-green-800',
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const style = priorityStyles[priority] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${style}`}>
      {priority}
    </span>
  );
};
