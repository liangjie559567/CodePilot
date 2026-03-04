import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CodeParseService } from './parse-service';
import { createTestDir, cleanupTestDir, createTestFile, waitFor, measureTime } from './test-helpers';
import * as fs from 'fs/promises';

describe('Performance: Throughput', () => {
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

  it('should process 50 files in < 5s', async () => {
    const files = await Promise.all(
      Array.from({ length: 50 }, (_, i) =>
        createTestFile(testDir, `file${i}.ts`, `const x${i} = ${i};`)
      )
    );

    service.start(testDir);
    await waitFor(200);

    const { time } = await measureTime(async () => {
      await Promise.all(files.map(f => fs.writeFile(f, 'const x = 0;', 'utf8')));
      await waitFor(500);
    });

    expect(time).toBeLessThan(5000);
  });
});
