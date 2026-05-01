import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkItems, WorkItem, ingestSignal } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

const Dashboard: React.FC = () => {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchItems = useCallback(async () => {
    try {
      const data = await getWorkItems();
      setItems(data);
      setError('');
    } catch {
      setError('Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 5000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  const handleTestSignal = async () => {
    const components = ['RDBMS_POSTGRES_01', 'CACHE_CLUSTER_01', 'API_GATEWAY_01', 'QUEUE_KAFKA_01'];
    const types = ['ERROR', 'LATENCY_SPIKE', 'TIMEOUT', 'CONNECTION_REFUSED'];
    const severities = ['CRITICAL', 'HIGH', 'WARNING'];
    await ingestSignal({
      component_id: components[Math.floor(Math.random() * components.length)],
      signal_type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      message: `Test signal generated at ${new Date().toISOString()}`,
    });
    setTimeout(fetchItems, 1000);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString();

  const formatMTTR = (seconds: number | null) => {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading incidents...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incident Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} incidents • Auto-refreshes every 5 seconds
          </p>
        </div>
        <button
          onClick={handleTestSignal}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          + Simulate Signal
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { status: 'OPEN', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
          { status: 'INVESTIGATING', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { status: 'RESOLVED', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
          { status: 'CLOSED', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
        ].map(({ status, color, bg, border }) => (
          <div key={status} className={`${bg} ${border} border rounded-lg p-5`}>
            <div className={`text-3xl font-bold ${color}`}>
              {items.filter(i => i.status === status).length}
            </div>
            <div className="text-sm text-gray-600 mt-1 font-medium">{status}</div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Incidents Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Priority', 'Component', 'Status', 'Signals', 'Created', 'MTTR', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  No incidents yet. Click "Simulate Signal" to create one.
                </td>
              </tr>
            ) : (
              items.map((item, i) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  onClick={() => navigate(`/incident/${item.id}`)}
                >
                  <td className="px-4 py-3"><PriorityBadge priority={item.priority} /></td>
                  <td className="px-4 py-3 font-semibold text-gray-900 text-sm">{item.component_id}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{item.signal_count}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{formatTime(item.created_at)}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-medium">{formatMTTR(item.mttr_seconds)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/incident/${item.id}`); }}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
