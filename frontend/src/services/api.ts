import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface WorkItem {
  id: string;
  component_id: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  priority: 'P0' | 'P1' | 'P2';
  signal_count: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  mttr_seconds: number | null;
}

export interface Signal {
  _id: string;
  component_id: string;
  signal_type: string;
  severity: string;
  message: string;
  metadata: Record<string, unknown>;
  work_item_id: string;
  received_at: string;
}

export interface RCAData {
  incident_start: string;
  incident_end: string;
  root_cause_category: string;
  fix_applied: string;
  prevention_steps: string;
}

export const getWorkItems = () =>
  api.get<WorkItem[]>('/workitems').then(r => r.data);

export const getWorkItem = (id: string) =>
  api.get<WorkItem>(`/workitems/${id}`).then(r => r.data);

export const getSignals = (workItemId: string) =>
  api.get<Signal[]>(`/signals/${workItemId}`).then(r => r.data);

export const updateStatus = (id: string, status: string, rca?: RCAData) =>
  api.patch<WorkItem>(`/workitems/${id}/status`, { status, rca }).then(r => r.data);

export const ingestSignal = (data: {
  component_id: string;
  signal_type: string;
  severity: string;
  message: string;
}) => api.post('/signals', data).then(r => r.data);
