import { InferenceRequest, InferenceResult, CacheEntry } from './types';
import { createHash } from 'crypto';

export class ResultCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;

  get(key: string): InferenceResult | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    this.cache.delete(key);
    this.cache.set(key, { ...entry, timestamp: Date.now() });

    return entry.result;
  }

  set(key: string, result: InferenceResult): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, { result, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  generateKey(request: InferenceRequest): string {
    const data = JSON.stringify({
      taskType: request.taskType,
      input: request.input,
      options: request.options
    });
    return createHash('sha256').update(data).digest('hex');
  }
}
