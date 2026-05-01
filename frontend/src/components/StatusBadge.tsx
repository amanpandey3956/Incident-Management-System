import React from 'react';

const colors: Record<string, { bg: string; color: string }> = {
  OPEN:          { bg: '#fff3cd', color: '#856404' },
  INVESTIGATING: { bg: '#cce5ff', color: '#004085' },
  RESOLVED:      { bg: '#d4edda', color: '#155724' },
  CLOSED:        { bg: '#e2e3e5', color: '#383d41' },
};

const PriorityColors: Record<string, { bg: string; color: string }> = {
  P0: { bg: '#f8d7da', color: '#721c24' },
  P1: { bg: '#fff3cd', color: '#856404' },
  P2: { bg: '#d4edda', color: '#155724' },
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const c = colors[status] || { bg: '#eee', color: '#333' };
  return (
    <span style={{
      backgroundColor: c.bg,
      color: c.color,
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
    }}>
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const c = PriorityColors[priority] || { bg: '#eee', color: '#333' };
  return (
    <span style={{
      backgroundColor: c.bg,
      color: c.color,
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 700,
    }}>
      {priority}
    </span>
  );
};
