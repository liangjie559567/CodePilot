import { EventEmitter } from 'events';
import { FileWatcherService } from './file-watcher';
import { BatchQueue } from './batch-queue';
import { IncrementalParser } from './incremental-parser';

export class CodeParseService extends EventEmitter {
  private watcher = new FileWatcherService();
  private queue = new BatchQueue(100);
  private parser = new IncrementalParser();

  constructor() {
    super();
  }

  start(projectRoot: string): void {
    this.watcher.start({ projectRoot });

    this.watcher.on('change', (path) => {
      this.queue.enqueue(path);
    });

    this.queue.on('batch', async (files) => {
      await this.parser.parseBatch(files);
      this.emit('parsed', files);
    });
  }

  stop(): void {
    this.watcher.stop();
  }

  async parse(filePath: string) {
    return this.parser.parse(filePath);
  }
}

export const parseService = new CodeParseService();
