import { pgPool } from '../config/db';
import { getAlertStrategy } from './alert.service';
import redis from '../config/redis';

const VALID_TRANSITIONS: Record<string, string[]> = {
  'OPEN': ['INVESTIGATING'],
  'INVESTIGATING': ['RESOLVED'],
  'RESOLVED': ['CLOSED'],
  'CLOSED': [],
};

export const createWorkItem = async (componentId: string) => {
  const strategy = getAlertStrategy(componentId);
  const priority = strategy.getPriority();
  const message = strategy.getAlertMessage(componentId);
  console.log(`🚨 Alert: ${message}`);

  const result = await pgPool.query(
    `INSERT INTO work_items (component_id, status, priority)
     VALUES ($1::text, 'OPEN', $2::text)
     RETURNING *`,
    [componentId, priority]
  );

  const workItem = result.rows[0];
  if (workItem) {
    await redis.setex(
      `workitem:${workItem.id}`,
      300,
      JSON.stringify(workItem)
    );
  }
  return workItem;
};

export const transitionWorkItem = async (
  workItemId: string,
  newStatus: string,
  rcaData?: {
    incident_start: string;
    incident_end: string;
    root_cause_category: string;
    fix_applied: string;
    prevention_steps: string;
  }
) => {
  const current = await pgPool.query(
    'SELECT * FROM work_items WHERE id = $1::uuid',
    [workItemId]
  );

  if (current.rows.length === 0) {
    throw new Error('Work item not found');
  }

  const currentStatus = current.rows[0].status;
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Invalid transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedTransitions.join(', ')}`
    );
  }

  if (newStatus === 'CLOSED') {
    if (!rcaData) {
      throw new Error('RCA is mandatory before closing a work item');
    }

    const { incident_start, incident_end, root_cause_category, fix_applied, prevention_steps } = rcaData;

    if (!incident_start || !incident_end || !root_cause_category || !fix_applied || !prevention_steps) {
      throw new Error('RCA is incomplete. All fields are required.');
    }

    const start = new Date(incident_start).getTime();
    const end = new Date(incident_end).getTime();
    const mttrSeconds = Math.floor((end - start) / 1000);

    await pgPool.query(
      `INSERT INTO rca_records 
       (work_item_id, incident_start, incident_end, root_cause_category, fix_applied, prevention_steps)
       VALUES ($1::uuid, $2::timestamp, $3::timestamp, $4::text, $5::text, $6::text)`,
      [workItemId, incident_start, incident_end, root_cause_category, fix_applied, prevention_steps]
    );

    await pgPool.query(
      `UPDATE work_items 
       SET status = $1::text, closed_at = NOW(), mttr_seconds = $2::int, updated_at = NOW()
       WHERE id = $3::uuid`,
      [newStatus, mttrSeconds, workItemId]
    );
  } else {
    await pgPool.query(
      `UPDATE work_items 
       SET status = $1::text, updated_at = NOW(),
       resolved_at = CASE WHEN $1::text = 'RESOLVED' THEN NOW() ELSE resolved_at END
       WHERE id = $2::uuid`,
      [newStatus, workItemId]
    );
  }

  await redis.del(`workitem:${workItemId}`);
  await redis.del('dashboard:workitems');

  const updated = await pgPool.query(
    'SELECT * FROM work_items WHERE id = $1::uuid',
    [workItemId]
  );

  return updated.rows[0];
};

export const getAllWorkItems = async () => {
  const cached = await redis.get('dashboard:workitems');
  if (cached) return JSON.parse(cached);

  const result = await pgPool.query(
    `SELECT * FROM work_items ORDER BY 
     CASE priority WHEN 'P0' THEN 1 WHEN 'P1' THEN 2 WHEN 'P2' THEN 3 END,
     created_at DESC`
  );

  await redis.setex('dashboard:workitems', 10, JSON.stringify(result.rows));
  return result.rows;
};

export const getWorkItemById = async (id: string) => {
  const cached = await redis.get(`workitem:${id}`);
  if (cached) return JSON.parse(cached);

  const result = await pgPool.query(
    'SELECT * FROM work_items WHERE id = $1::uuid',
    [id]
  );
  return result.rows[0];
};
