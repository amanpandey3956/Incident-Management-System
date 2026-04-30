export interface WorkItem {
  id: string;
  component_id: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  priority: 'P0' | 'P1' | 'P2';
  signal_count: number;
  created_at: Date;
  updated_at: Date;
  resolved_at: Date | null;
  closed_at: Date | null;
  mttr_seconds: number | null;
}
