export interface RCA {
  id: string;
  work_item_id: string;
  incident_start: Date;
  incident_end: Date;
  root_cause_category: string;
  fix_applied: string;
  prevention_steps: string;
  created_at: Date;
}

export const ROOT_CAUSE_CATEGORIES = [
  'Hardware Failure',
  'Software Bug',
  'Configuration Error',
  'Network Issue',
  'Capacity Exhaustion',
  'Security Incident',
  'Third Party Failure',
  'Human Error',
  'Unknown',
] as const;
