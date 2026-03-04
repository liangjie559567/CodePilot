import { EventEmitter } from 'events';

export class BatchQueue extends EventEmitter {
  private queue = new Set<string>();
  private timer: NodeJS.Timeout | null = null;

  constructor(private windowMs: number = 100) {
    super();
  }

  enqueue(filePath: string): void {
    this.queue.add(filePath);
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.windowMs);
    }
  }

  private flush(): void {
    if (this.queue.size > 0) {
      const files = Array.from(this.queue);
      this.queue.clear();
      this.emit('batch', files);
    }
    this.timer = null;
  }
}
