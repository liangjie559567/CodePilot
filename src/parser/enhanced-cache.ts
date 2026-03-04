export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount?: number;
}

export class EnhancedLRUCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();

  constructor(private maxSize: number = 100) {}

  set(key: string, value: CacheEntry<T>): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldest = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldest);
    }
    this.cache.set(key, value);
  }

  get(key: string): CacheEntry<T> | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      entry.timestamp = Date.now();
      entry.accessCount = (entry.accessCount || 0) + 1;
    }
    return entry;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
