import { Request, Response } from 'express';
import { pgPool } from '../config/db';
import redis from '../config/redis';
import mongoose from 'mongoose';

export const healthCheck = async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      postgres: 'unknown',
      mongodb: 'unknown',
      redis: 'unknown',
    },
  };

  try {
    await pgPool.query('SELECT 1');
    health.services.postgres = 'healthy';
  } catch {
    health.services.postgres = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    await redis.ping();
    health.services.redis = 'healthy';
  } catch {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }

  health.services.mongodb =
    mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';

  res.status(health.status === 'ok' ? 200 : 503).json(health);
};
