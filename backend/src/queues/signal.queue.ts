import { Queue } from 'bullmq';
import redis from '../config/redis';

export const signalQueue = new Queue('signal-processing', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const addSignalToQueue = async (signalData: {
  component_id: string;
  signal_type: string;
  severity: string;
  message: string;
  metadata?: Record<string, unknown>;
}) => {
  await signalQueue.add('process-signal', signalData, {
    jobId: `${signalData.component_id}-${Date.now()}`,
  });
};
