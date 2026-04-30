import { pgPool } from '../config/db';

export const getRCAByWorkItem = async (workItemId: string) => {
  const result = await pgPool.query(
    'SELECT * FROM rca_records WHERE work_item_id = $1',
    [workItemId]
  );
  return result.rows[0] || null;
};

export const validateRCA = (rca: {
  incident_start: string;
  incident_end: string;
  root_cause_category: string;
  fix_applied: string;
  prevention_steps: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!rca.incident_start) errors.push('Incident start time is required');
  if (!rca.incident_end) errors.push('Incident end time is required');
  if (!rca.root_cause_category) errors.push('Root cause category is required');
  if (!rca.fix_applied || rca.fix_applied.trim().length < 10)
    errors.push('Fix applied must be at least 10 characters');
  if (!rca.prevention_steps || rca.prevention_steps.trim().length < 10)
    errors.push('Prevention steps must be at least 10 characters');

  if (rca.incident_start && rca.incident_end) {
    const start = new Date(rca.incident_start);
    const end = new Date(rca.incident_end);
    if (end <= start) errors.push('Incident end must be after incident start');
  }

  return { valid: errors.length === 0, errors };
};
