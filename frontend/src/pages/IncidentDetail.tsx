import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkItem, getSignals, updateStatus, WorkItem, Signal } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

const NEXT_STATUS: Record<string, string> = {
  OPEN: 'INVESTIGATING',
  INVESTIGATING: 'RESOLVED',
  RESOLVED: 'CLOSED',
};

const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<WorkItem | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getWorkItem(id), getSignals(id)]).then(([w, s]) => {
      setItem(w);
      setSignals(s);
      setLoading(false);
    });
  }, [id]);

  const handleTransition = async () => {
    if (!item || !id) return;
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    if (next === 'CLOSED') {
      navigate(`/incident/${id}/rca`);
      return;
    }
    setUpdating(true);
    try {
      const updated = await updateStatus(id, next);
      setItem(updated);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!item) return <div className="text-center py-12 text-gray-500">Incident not found</div>;

  const nextStatus = NEXT_STATUS[item.status];

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="text-gray-500 hover:text-gray-900 text-sm mb-4 transition-colors"
      >
        &larr; Back to Dashboard
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-3">
              <PriorityBadge priority={item.priority} />
              <StatusBadge status={item.status} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{item.component_id}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {item.signal_count} signals linked • Created {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
          {nextStatus && (
            <button
              onClick={handleTransition}
              disabled={updating}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                nextStatus === 'CLOSED' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-gray-900 hover:bg-gray-800'
              }`}
            >
              {updating ? 'Updating...' : nextStatus === 'CLOSED' ? 'Submit RCA & Close' : `Mark ${nextStatus}`}
            </button>
          )}
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          {[
            { label: 'Created', value: new Date(item.created_at).toLocaleString() },
            { label: 'Resolved', value: item.resolved_at ? new Date(item.resolved_at).toLocaleString() : '—' },
            { label: 'MTTR', value: item.mttr_seconds ? `${Math.floor(item.mttr_seconds / 60)} minutes` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 font-medium mb-1">{label}</div>
              <div className="text-sm font-semibold text-gray-900">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Signals */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Raw Signals ({signals.length})</h3>
        {signals.length === 0 ? (
          <p className="text-gray-400 text-center py-6 text-sm">No signals yet</p>
        ) : (
          <div className="space-y-3">
            {signals.map(s => (
              <div key={s._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm text-gray-900">{s.signal_type}</span>
                  <span className="text-xs text-gray-400">{new Date(s.received_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{s.message}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  s.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                  s.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {s.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentDetail;
