import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CodeParseService } from './parse-service';
import * as fs from 'fs';
import * as path from 'path';

describe('CodeParseService Integration', () => {
  const testDir = path.join(process.cwd(), 'test-temp');
  const testFile = path.join(testDir, 'test.ts');
  let service: CodeParseService;

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    service = new CodeParseService();
  });

  afterEach(() => {
    service.stop();
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should start and stop service', () => {
    expect(() => service.start(testDir)).not.toThrow();
    expect(() => service.stop()).not.toThrow();
  });
});
