import { describe, it, expect } from 'vitest';
import {
  registerPendingPermission,
  resolvePendingPermission
} from '../../lib/permission-registry';

describe('permission-registry', () => {
  it('should register and resolve permission', async () => {
    const id = 'test-1';
    const promise = registerPendingPermission(id, { path: '/test.txt' });

    resolvePendingPermission(id, {
      behavior: 'allow',
      updatedInput: { path: '/test.txt' }
    });

    const result = await promise;
    expect(result.behavior).toBe('allow');
  });

  it('should handle denial', async () => {
    const id = 'test-2';
    const promise = registerPendingPermission(id, { path: '/test.txt' });

    resolvePendingPermission(id, {
      behavior: 'deny',
      message: 'User denied'
    });

    const result = await promise;
    expect(result.behavior).toBe('deny');
  });
});
