import { validateRCA } from '../services/rca.service';

describe('RCA Validation', () => {

  test('should pass with all valid fields', () => {
    const result = validateRCA({
      incident_start: '2026-04-30T10:00:00Z',
      incident_end: '2026-04-30T11:30:00Z',
      root_cause_category: 'Hardware Failure',
      fix_applied: 'Increased connection pool size and restarted service',
      prevention_steps: 'Set up monitoring alerts and auto-scaling policies',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should fail when incident_start is missing', () => {
    const result = validateRCA({
      incident_start: '',
      incident_end: '2026-04-30T11:30:00Z',
      root_cause_category: 'Hardware Failure',
      fix_applied: 'Fixed the issue properly',
      prevention_steps: 'Added monitoring alerts',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Incident start time is required');
  });

  test('should fail when incident_end is missing', () => {
    const result = validateRCA({
      incident_start: '2026-04-30T10:00:00Z',
      incident_end: '',
      root_cause_category: 'Hardware Failure',
      fix_applied: 'Fixed the issue properly',
      prevention_steps: 'Added monitoring alerts',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Incident end time is required');
  });

  test('should fail when root_cause_category is missing', () => {
    const result = validateRCA({
      incident_start: '2026-04-30T10:00:00Z',
      incident_end: '2026-04-30T11:30:00Z',
      root_cause_category: '',
      fix_applied: 'Fixed the issue properly',
      prevention_steps: 'Added monitoring alerts',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Root cause category is required');
  });

  test('should fail when fix_applied is too short', () => {
    const result = validateRCA({
      incident_start: '2026-04-30T10:00:00Z',
      incident_end: '2026-04-30T11:30:00Z',
      root_cause_category: 'Software Bug',
      fix_applied: 'Fixed',
      prevention_steps: 'Added monitoring alerts',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Fix applied must be at least 10 characters');
  });

  test('should fail when prevention_steps is too short', () => {
    const result = validateRCA({
      incident_start: '2026-04-30T10:00:00Z',
      incident_end: '2026-04-30T11:30:00Z',
      root_cause_category: 'Network Issue',
      fix_applied: 'Restarted the network service',
      prevention_steps: 'Monitor',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Prevention steps must be at least 10 characters');
  });

  test('should fail when end time is before start time', () => {
    const result = validateRCA({
      incident_start: '2026-04-30T11:00:00Z',
      incident_end: '2026-04-30T10:00:00Z',
      root_cause_category: 'Configuration Error',
      fix_applied: 'Rolled back the configuration change',
      prevention_steps: 'Added config validation pipeline',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Incident end must be after incident start');
  });

  test('should fail with multiple errors at once', () => {
    const result = validateRCA({
      incident_start: '',
      incident_end: '',
      root_cause_category: '',
      fix_applied: '',
      prevention_steps: '',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

});
