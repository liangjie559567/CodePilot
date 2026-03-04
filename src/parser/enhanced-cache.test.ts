import { describe, it, expect } from 'vitest';
import { EnhancedLRUCache } from './enhanced-cache';

describe('EnhancedLRUCache', () => {
  it('should evict oldest entry when max size reached', () => {
    const cache = new EnhancedLRUCache(2);
    cache.set('a', { data: 'a', timestamp: 1 });
    cache.set('b', { data: 'b', timestamp: 2 });
    cache.set('c', { data: 'c', timestamp: 3 });

    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
    expect(cache.has('c')).toBe(true);
  });
});
