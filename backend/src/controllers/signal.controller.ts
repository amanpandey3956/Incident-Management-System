import { Request, Response } from 'express';
import { addSignalToQueue } from '../queues/signal.queue';
import { getSignalsByWorkItem } from '../services/signal.service';

export const ingestSignal = async (req: Request, res: Response) => {
  try {
    const { component_id, signal_type, severity, message, metadata } = req.body;

    if (!component_id || !signal_type || !severity || !message) {
      res.status(400).json({ error: 'Missing required fields: component_id, signal_type, severity, message' });
      return;
    }

    await addSignalToQueue({ component_id, signal_type, severity, message, metadata });

    res.status(202).json({
      message: 'Signal accepted for processing',
      component_id,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to ingest signal' });
  }
};

export const getSignals = async (req: Request, res: Response) => {
  try {
    const { workItemId } = req.params;
    const signals = await getSignalsByWorkItem(workItemId);
    res.json(signals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
};
