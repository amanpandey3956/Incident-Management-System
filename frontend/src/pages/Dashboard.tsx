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

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading incidents...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1a1a2e' }}>Incident Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
            {items.length} incidents • Auto-refreshes every 5 seconds
          </p>
        </div>
        <button onClick={handleTestSignal} style={{
          backgroundColor: '#e94560',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px',
        }}>
          + Simulate Signal
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'].map(status => (
          <div key={status} style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a2e' }}>
              {items.filter(i => i.status === status).length}
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{status}</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Incidents Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
              {['Priority', 'Component', 'Status', 'Signals', 'Created', 'MTTR', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  No incidents yet. Click "Simulate Signal" to create one.
                </td>
              </tr>
            ) : (
              items.map((item, i) => (
                <tr key={item.id} style={{
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa',
                  cursor: 'pointer',
                }}
                  onClick={() => navigate(`/incident/${item.id}`)}
                >
                  <td style={{ padding: '14px 16px' }}><PriorityBadge priority={item.priority} /></td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1a1a2e', fontSize: '14px' }}>
                    {item.component_id}
                  </td>
                  <td style={{ padding: '14px 16px' }}><StatusBadge status={item.status} /></td>
                  <td style={{ padding: '14px 16px', color: '#666', fontSize: '14px' }}>{item.signal_count}</td>
                  <td style={{ padding: '14px 16px', color: '#666', fontSize: '13px' }}>{formatTime(item.created_at)}</td>
                  <td style={{ padding: '14px 16px', color: '#666', fontSize: '14px' }}>{formatMTTR(item.mttr_seconds)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/incident/${item.id}`); }}
                      style={{
                        backgroundColor: '#1a1a2e',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
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
