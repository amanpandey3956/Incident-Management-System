import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateStatus, RCAData } from '../services/api';

const ROOT_CAUSE_CATEGORIES = [
  'Hardware Failure', 'Software Bug', 'Configuration Error',
  'Network Issue', 'Capacity Exhaustion', 'Security Incident',
  'Third Party Failure', 'Human Error', 'Unknown',
];

const RCAForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<RCAData>({
    incident_start: '',
    incident_end: '',
    root_cause_category: '',
    fix_applied: '',
    prevention_steps: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (!form.incident_start || !form.incident_end || !form.root_cause_category
      || !form.fix_applied || !form.prevention_steps) {
      setError('All fields are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await updateStatus(id, 'CLOSED', form);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit RCA');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '14px', boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px',
    fontSize: '13px', fontWeight: 600, color: '#444',
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#666', fontSize: '14px', marginBottom: '16px', padding: 0,
      }}>
        ← Back
      </button>

      <div style={{
        backgroundColor: '#fff', borderRadius: '12px',
        padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>Root Cause Analysis</h2>
        <p style={{ margin: '0 0 24px', color: '#666', fontSize: '14px' }}>
          Complete all fields to close this incident. MTTR will be calculated automatically.
        </p>

        {error && (
          <div style={{
            backgroundColor: '#f8d7da', color: '#721c24',
            padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Incident Start *</label>
              <input type="datetime-local" name="incident_start"
                value={form.incident_start} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Incident End *</label>
              <input type="datetime-local" name="incident_end"
                value={form.incident_end} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Root Cause Category *</label>
            <select name="root_cause_category"
              value={form.root_cause_category} onChange={handleChange} style={inputStyle}>
              <option value="">Select a category...</option>
              {ROOT_CAUSE_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Fix Applied *</label>
            <textarea name="fix_applied" rows={4}
              value={form.fix_applied} onChange={handleChange}
              placeholder="Describe what was done to fix the issue..."
              style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Prevention Steps *</label>
            <textarea name="prevention_steps" rows={4}
              value={form.prevention_steps} onChange={handleChange}
              placeholder="Describe steps to prevent this from happening again..."
              style={inputStyle} />
          </div>

          <button onClick={handleSubmit} disabled={submitting} style={{
            backgroundColor: '#e94560', color: '#fff',
            border: 'none', padding: '14px',
            borderRadius: '8px', cursor: 'pointer',
            fontWeight: 700, fontSize: '16px',
            opacity: submitting ? 0.7 : 1,
          }}>
            {submitting ? 'Submitting...' : '✓ Submit RCA & Close Incident'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RCAForm;
