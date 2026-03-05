import { describe, it, expect } from 'vitest';
import { getSetting, setSetting } from '../../lib/db';

describe('database operations', () => {
  it('should set and get settings', async () => {
    await setSetting('test-key', 'test-value');
    const value = await getSetting('test-key');
    expect(value).toBe('test-value');
  });
});
