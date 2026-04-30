import redis from '../config/redis';

const DEBOUNCE_WINDOW = 10; // seconds
const DEBOUNCE_THRESHOLD = 100; // signals

export const checkDebounce = async (componentId: string): Promise<{
  shouldCreateWorkItem: boolean;
  signalCount: number;
}> => {
  const key = `debounce:${componentId}`;
  const count = await redis.incr(key);

  // Set expiry only on first signal
  if (count === 1) {
    await redis.expire(key, DEBOUNCE_WINDOW);
  }

  // Only create work item on first signal or every 100 signals
  const shouldCreateWorkItem = count === 1;

  return { shouldCreateWorkItem, signalCount: count };
};

export const getDebounceCount = async (componentId: string): Promise<number> => {
  const key = `debounce:${componentId}`;
  const count = await redis.get(key);
  return parseInt(count || '0');
};
