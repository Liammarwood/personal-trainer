import { describe, it, expect } from 'vitest';
import buildInfo, { APP_VERSION, COMMIT_SHA, BUILD_TIME, REPOSITORY } from '../buildInfo';

describe('buildInfo', () => {
  it('should export buildInfo object with all properties', () => {
    expect(buildInfo).toBeDefined();
    expect(buildInfo).toHaveProperty('version');
    expect(buildInfo).toHaveProperty('commit');
    expect(buildInfo).toHaveProperty('buildTime');
    expect(buildInfo).toHaveProperty('repository');
  });

  it('should export individual constants', () => {
    expect(APP_VERSION).toBeDefined();
    expect(COMMIT_SHA).toBeDefined();
    expect(BUILD_TIME).toBeDefined();
    expect(REPOSITORY).toBeDefined();
  });

  it('should have matching values between object and exports', () => {
    expect(buildInfo.version).toBe(APP_VERSION);
    expect(buildInfo.commit).toBe(COMMIT_SHA);
    expect(buildInfo.buildTime).toBe(BUILD_TIME);
    expect(buildInfo.repository).toBe(REPOSITORY);
  });

  it('should handle empty environment variables', () => {
    // Values should default to empty strings if not set
    expect(typeof APP_VERSION).toBe('string');
    expect(typeof COMMIT_SHA).toBe('string');
    expect(typeof BUILD_TIME).toBe('string');
    expect(typeof REPOSITORY).toBe('string');
  });
});
