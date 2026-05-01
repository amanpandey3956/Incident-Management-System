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

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  if (!item) return <div style={{ textAlign: 'center', padding: '40px' }}>Incident not found</div>;

  const nextStatus = NEXT_STATUS[item.status];

  return (
    <div>
      <button onClick={() => navigate('/')} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#666', fontSize: '14px', marginBottom: '16px', padding: 0,
      }}>
        ← Back to Dashboard
      </button>

      {/* Header Card */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '12px',
        padding: '24px', marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <PriorityBadge priority={item.priority} />
              <StatusBadge status={item.status} />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '22px', color: '#1a1a2e' }}>
              {item.component_id}
            </h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              {item.signal_count} signals linked • Created {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
          {nextStatus && (
            <button onClick={handleTransition} disabled={updating} style={{
              backgroundColor: nextStatus === 'CLOSED' ? '#e94560' : '#1a1a2e',
              color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: '8px',
              cursor: 'pointer', fontWeight: 600, fontSize: '14px',
            }}>
              {updating ? 'Updating...' : nextStatus === 'CLOSED' ? '📋 Submit RCA & Close' : `→ Mark ${nextStatus}`}
            </button>
          )}
        </div>

        {/* Timeline */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '20px' }}>
          {[
            { label: 'Created', value: new Date(item.created_at).toLocaleString() },
            { label: 'Resolved', value: item.resolved_at ? new Date(item.resolved_at).toLocaleString() : '—' },
            { label: 'MTTR', value: item.mttr_seconds ? `${Math.floor(item.mttr_seconds / 60)} minutes` : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Signals */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '12px',
        padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <h3 style={{ margin: '0 0 16px', color: '#1a1a2e' }}>Raw Signals ({signals.length})</h3>
        {signals.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No signals yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {signals.map(s => (
              <div key={s._id} style={{
                border: '1px solid #e9ecef', borderRadius: '8px',
                padding: '14px', backgroundColor: '#fafafa',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a2e' }}>
                    {s.signal_type}
                  </span>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(s.received_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#333' }}>{s.message}</p>
                <span style={{
                  fontSize: '11px', padding: '2px 8px',
                  borderRadius: '10px', backgroundColor: '#f8d7da', color: '#721c24',
                }}>
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
