import chokidar from 'chokidar';
import { EventEmitter } from 'events';

export interface FileWatcherConfig {
  projectRoot: string;
  ignored?: string[];
  extensions?: string[];
}

export class FileWatcherService extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;

  start(config: FileWatcherConfig): void {
    const { projectRoot, ignored = [], extensions = ['.ts', '.tsx', '.js', '.jsx', '.py'] } = config;

    this.watcher = chokidar.watch(projectRoot, {
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', ...ignored],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 }
    });

    this.watcher.on('change', (path: string) => {
      if (extensions.some(ext => path.endsWith(ext))) {
        this.emit('change', path);
      }
    });
  }

  stop(): void {
    this.watcher?.close();
    this.watcher = null;
  }
}
