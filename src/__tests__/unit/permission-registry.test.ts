import { describe, it, expect, beforeEach } from 'vitest';
import { PermissionRegistry } from '@/lib/permission-registry';

describe('PermissionRegistry', () => {
  let registry: PermissionRegistry;

  beforeEach(() => {
    registry = new PermissionRegistry();
  });

  describe('registerRequest', () => {
    it('should register a permission request', () => {
      const requestId = registry.registerRequest({
        tool: 'read_file',
        input: { path: '/test.txt' }
      });

      expect(requestId).toBeDefined();
      expect(typeof requestId).toBe('string');
    });

    it('should generate unique request IDs', () => {
      const id1 = registry.registerRequest({ tool: 'read_file', input: {} });
      const id2 = registry.registerRequest({ tool: 'write_file', input: {} });

      expect(id1).not.toBe(id2);
    });
  });

  describe('resolveRequest', () => {
    it('should resolve approved request', () => {
      const requestId = registry.registerRequest({
        tool: 'read_file',
        input: { path: '/test.txt' }
      });

      registry.resolveRequest(requestId, true);
      const result = registry.getResult(requestId);

      expect(result).toBe(true);
    });

    it('should resolve denied request', () => {
      const requestId = registry.registerRequest({
        tool: 'write_file',
        input: { path: '/test.txt' }
      });

      registry.resolveRequest(requestId, false);
      const result = registry.getResult(requestId);

      expect(result).toBe(false);
    });
  });

  describe('waitForResponse', () => {
    it('should wait for approval', async () => {
      const requestId = registry.registerRequest({
        tool: 'read_file',
        input: {}
      });

      setTimeout(() => registry.resolveRequest(requestId, true), 10);

      const result = await registry.waitForResponse(requestId, 1000);
      expect(result).toBe(true);
    });

    it('should timeout if no response', async () => {
      const requestId = registry.registerRequest({
        tool: 'read_file',
        input: {}
      });

      await expect(
        registry.waitForResponse(requestId, 100)
      ).rejects.toThrow('timeout');
    });
  });
});
