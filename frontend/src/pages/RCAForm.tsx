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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-gray-500 hover:text-gray-900 text-sm mb-4 transition-colors"
      >
        &larr; Back
      </button>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Root Cause Analysis</h2>
        <p className="text-sm text-gray-500 mb-6">Complete all fields to close this incident. MTTR will be calculated automatically.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Incident Start *</label>
              <input
                type="datetime-local"
                name="incident_start"
                value={form.incident_start}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Incident End *</label>
              <input
                type="datetime-local"
                name="incident_end"
                value={form.incident_end}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          {/* Root Cause Category */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Root Cause Category *</label>
            <select
              name="root_cause_category"
              value={form.root_cause_category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
            >
              <option value="">Select a category...</option>
              {ROOT_CAUSE_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Fix Applied */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Fix Applied *</label>
            <textarea
              name="fix_applied"
              rows={4}
              value={form.fix_applied}
              onChange={handleChange}
              placeholder="Describe what was done to fix the issue..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
            />
          </div>

          {/* Prevention Steps */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Prevention Steps *</label>
            <textarea
              name="prevention_steps"
              rows={4}
              value={form.prevention_steps}
              onChange={handleChange}
              placeholder="Describe steps to prevent this from happening again..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit RCA & Close Incident'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RCAForm;
