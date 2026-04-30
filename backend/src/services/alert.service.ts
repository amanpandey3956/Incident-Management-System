// Strategy Pattern for alerting

interface AlertStrategy {
  getPriority(): string;
  getAlertMessage(componentId: string): string;
}

class RDBMSAlertStrategy implements AlertStrategy {
  getPriority() { return 'P0'; }
  getAlertMessage(componentId: string) {
    return `CRITICAL: Database failure detected on ${componentId}. Immediate action required!`;
  }
}

class CacheAlertStrategy implements AlertStrategy {
  getPriority() { return 'P2'; }
  getAlertMessage(componentId: string) {
    return `WARNING: Cache failure detected on ${componentId}. Performance may be degraded.`;
  }
}

class APIAlertStrategy implements AlertStrategy {
  getPriority() { return 'P1'; }
  getAlertMessage(componentId: string) {
    return `HIGH: API failure detected on ${componentId}. Service availability impacted.`;
  }
}

class QueueAlertStrategy implements AlertStrategy {
  getPriority() { return 'P1'; }
  getAlertMessage(componentId: string) {
    return `HIGH: Queue failure detected on ${componentId}. Message processing halted.`;
  }
}

class DefaultAlertStrategy implements AlertStrategy {
  getPriority() { return 'P2'; }
  getAlertMessage(componentId: string) {
    return `WARNING: Failure detected on ${componentId}.`;
  }
}

// Factory to get right strategy based on component type
export const getAlertStrategy = (componentId: string): AlertStrategy => {
  const id = componentId.toUpperCase();
  if (id.includes('DB') || id.includes('RDBMS') || id.includes('POSTGRES')) {
    return new RDBMSAlertStrategy();
  }
  if (id.includes('CACHE') || id.includes('REDIS')) {
    return new CacheAlertStrategy();
  }
  if (id.includes('API') || id.includes('MCP')) {
    return new APIAlertStrategy();
  }
  if (id.includes('QUEUE') || id.includes('KAFKA') || id.includes('RABBIT')) {
    return new QueueAlertStrategy();
  }
  return new DefaultAlertStrategy();
};
