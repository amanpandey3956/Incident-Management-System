import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initPostgres, connectMongo } from './config/db';
import { signalRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { ingestSignal, getSignals } from './controllers/signal.controller';
import { listWorkItems, getWorkItem, updateWorkItemStatus, getAggregations } from './controllers/workitem.controller';
import { healthCheck } from './controllers/health.controller';
import { startWorker } from './queues/worker';
import { startMetricsPrinter } from './utils/metrics';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.get('/health', healthCheck);
app.post('/api/signals', signalRateLimiter, ingestSignal);
app.get('/api/signals/:workItemId', getSignals);
app.get('/api/workitems', listWorkItems);
app.get('/api/workitems/:id', getWorkItem);
app.patch('/api/workitems/:id/status', updateWorkItemStatus);
app.get('/api/aggregations', getAggregations);

app.use(errorHandler);

const start = async () => {
  await connectMongo();
  await initPostgres();
  startWorker();
  startMetricsPrinter();

  app.listen(PORT, () => {
    console.log(`🚀 IMS Backend running on port ${PORT}`);
  });
};

start();
