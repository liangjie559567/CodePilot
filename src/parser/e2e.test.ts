import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CodeParseService } from './parse-service';
import { createTestDir, cleanupTestDir, createTestFile, waitFor } from './test-helpers';
import * as fs from 'fs/promises';

describe('E2E: Basic Workflow', () => {
  let testDir: string;
  let service: CodeParseService;

  beforeEach(async () => {
    testDir = await createTestDir();
    service = new CodeParseService();
  });

  afterEach(async () => {
    service.stop();
    await waitFor(100);
    await cleanupTestDir(testDir);
  });

  it('should trigger parse on file change', async () => {
    const file = await createTestFile(testDir, 'test.ts', 'const x = 1;');

    let parseCount = 0;
    service.on('parsed', () => { parseCount++; });

    service.start(testDir);
    await waitFor(200);

    await fs.writeFile(file, 'const x = 2;', 'utf8');
    await waitFor(300);

    expect(parseCount).toBeGreaterThan(0);
  });

  it('should batch multiple changes', async () => {
    const files = await Promise.all([
      createTestFile(testDir, 'file1.ts', 'const a = 1;'),
      createTestFile(testDir, 'file2.ts', 'const b = 2;'),
      createTestFile(testDir, 'file3.ts', 'const c = 3;'),
    ]);

    let batchCount = 0;
    service.on('parsed', () => { batchCount++; });

    service.start(testDir);
    await waitFor(200);

    await Promise.all(files.map(f => fs.writeFile(f, 'const x = 0;', 'utf8')));
    await waitFor(300);

    expect(batchCount).toBe(1);
  });

  it('should deduplicate same file', async () => {
    const file = await createTestFile(testDir, 'test.ts', 'const x = 1;');

    let parseCount = 0;
    service.on('parsed', () => { parseCount++; });

    service.start(testDir);
    await waitFor(200);

    await fs.writeFile(file, 'const x = 2;', 'utf8');
    await fs.writeFile(file, 'const x = 3;', 'utf8');
    await fs.writeFile(file, 'const x = 4;', 'utf8');

    await waitFor(300);

    expect(parseCount).toBe(1);
  });
});
