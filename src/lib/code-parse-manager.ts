import { CodeParseService } from '../parser';
import { saveParseResult } from './db';

class CodeParseManager {
  private static instance: CodeParseManager;
  private services = new Map<string, CodeParseService>();

  private constructor() {}

  static getInstance(): CodeParseManager {
    if (!CodeParseManager.instance) {
      CodeParseManager.instance = new CodeParseManager();
    }
    return CodeParseManager.instance;
  }

  startMonitoring(projectRoot: string, sessionId?: string): void {
    if (this.services.has(projectRoot)) return;

    const service = new CodeParseService();

    service.on('parsed', (files: string[]) => {
      files.forEach(file => {
        saveParseResult(
          file,
          projectRoot,
          JSON.stringify([]),
          'AST parsed',
          sessionId
        );
      });
    });

    service.start(projectRoot);
    this.services.set(projectRoot, service);
  }

  stopMonitoring(projectRoot: string): void {
    const service = this.services.get(projectRoot);
    if (service) {
      service.stop();
      this.services.delete(projectRoot);
    }
  }

  stopAll(): void {
    this.services.forEach(service => service.stop());
    this.services.clear();
  }
}

export const codeParseManager = CodeParseManager.getInstance();
