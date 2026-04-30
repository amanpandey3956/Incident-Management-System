import Signal from '../models/Signal';
import { checkDebounce } from '../utils/debounce';
import { createWorkItem } from './workitem.service';
import { pgPool } from '../config/db';
import { incrementSignalCount } from '../utils/metrics';

export const processSignal = async (signalData: {
  component_id: string;
  signal_type: string;
  severity: string;
  message: string;
  metadata?: Record<string, unknown>;
}) => {
  incrementSignalCount();

  // Check debounce — only create work item on first signal in 10s window
  const { shouldCreateWorkItem } = await checkDebounce(signalData.component_id);

  let workItemId = null;

  if (shouldCreateWorkItem) {
    // Check if open work item already exists for this component
    const existing = await pgPool.query(
      `SELECT id FROM work_items 
       WHERE component_id = $1 AND status NOT IN ('CLOSED')
       ORDER BY created_at DESC LIMIT 1`,
      [signalData.component_id]
    );

    if (existing.rows.length > 0) {
      workItemId = existing.rows[0].id;
      // Increment signal count on existing work item
      await pgPool.query(
        `UPDATE work_items SET signal_count = signal_count + 1, updated_at = NOW() WHERE id = $1`,
        [workItemId]
      );
    } else {
      const workItem = await createWorkItem(signalData.component_id);
      if (workItem) workItemId = workItem.id;
    }
  } else {
    // Link to existing open work item
    const existing = await pgPool.query(
      `SELECT id FROM work_items 
       WHERE component_id = $1 AND status NOT IN ('CLOSED')
       ORDER BY created_at DESC LIMIT 1`,
      [signalData.component_id]
    );
    if (existing.rows.length > 0) {
      workItemId = existing.rows[0].id;
      await pgPool.query(
        `UPDATE work_items SET signal_count = signal_count + 1, updated_at = NOW() WHERE id = $1`,
        [workItemId]
      );
    }
  }

  // Always store raw signal in MongoDB
  const signal = new Signal({
    ...signalData,
    work_item_id: workItemId,
  });
  await signal.save();

  return { signal, workItemId };
};

export const getSignalsByWorkItem = async (workItemId: string) => {
  return Signal.find({ work_item_id: workItemId }).sort({ received_at: -1 }).limit(100);
};
