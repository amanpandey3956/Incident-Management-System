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
