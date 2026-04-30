import { Worker } from 'bullmq';
import redis from '../config/redis';
import { processSignal } from '../services/signal.service';

export const startWorker = () => {
  const worker = new Worker(
    'signal-processing',
    async (job) => {
      const { component_id, signal_type, severity, message, metadata } = job.data;
      await processSignal({ component_id, signal_type, severity, message, metadata });
    },
    {
      connection: redis,
      concurrency: 10, // Process 10 jobs simultaneously
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Signal processed: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Signal failed: ${job?.id} — ${err.message}`);
  });

  console.log('🚀 Signal worker started');
  return worker;
};
