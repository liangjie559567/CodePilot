import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BatchQueue } from './batch-queue';

describe('BatchQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should batch multiple enqueues within window', async () => {
    const queue = new BatchQueue(100);
    const handler = vi.fn();
    queue.on('batch', handler);

    queue.enqueue('file1.ts');
    queue.enqueue('file2.ts');
    queue.enqueue('file1.ts'); // duplicate

    vi.advanceTimersByTime(150);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(['file1.ts', 'file2.ts']);
  });

  it('should deduplicate files', () => {
    const queue = new BatchQueue(100);
    const handler = vi.fn();
    queue.on('batch', handler);

    queue.enqueue('file1.ts');
    queue.enqueue('file1.ts');
    queue.enqueue('file1.ts');

    vi.advanceTimersByTime(150);

    expect(handler).toHaveBeenCalledWith(['file1.ts']);
  });
});
