import { Request, Response } from 'express';
import {
  getAllWorkItems,
  getWorkItemById,
  transitionWorkItem,
} from '../services/workitem.service';

export const listWorkItems = async (req: Request, res: Response) => {
  try {
    const items = await getAllWorkItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch work items' });
  }
};

export const getWorkItem = async (req: Request, res: Response) => {
  try {
    const item = await getWorkItemById(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Work item not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch work item' });
  }
};

export const updateWorkItemStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rca } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const updated = await transitionWorkItem(id, status, rca);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getAggregations = async (req: Request, res: Response) => {
  try {
    const { pgPool } = await import('../config/db');

    const [incidentsByHour, incidentsByPriority, avgMTTR, incidentsByStatus] = await Promise.all([
      // Incidents created per hour (last 24 hours)
      pgPool.query(`
        SELECT 
          date_trunc('hour', created_at) AS hour,
          COUNT(*) AS count
        FROM work_items
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY hour
        ORDER BY hour ASC
      `),

      // Incidents by priority
      pgPool.query(`
        SELECT priority, COUNT(*) AS count
        FROM work_items
        GROUP BY priority
        ORDER BY priority ASC
      `),

      // Average MTTR in minutes
      pgPool.query(`
        SELECT 
          ROUND(AVG(mttr_seconds) / 60.0, 2) AS avg_mttr_minutes,
          MIN(mttr_seconds) / 60 AS min_mttr_minutes,
          MAX(mttr_seconds) / 60 AS max_mttr_minutes
        FROM work_items
        WHERE mttr_seconds IS NOT NULL
      `),

      // Incidents by status
      pgPool.query(`
        SELECT status, COUNT(*) AS count
        FROM work_items
        GROUP BY status
        ORDER BY status ASC
      `),
    ]);

    res.json({
      incidents_by_hour: incidentsByHour.rows,
      incidents_by_priority: incidentsByPriority.rows,
      mttr_stats: avgMTTR.rows[0],
      incidents_by_status: incidentsByStatus.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
