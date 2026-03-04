import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { codeParseManager } from './code-parse-manager';
import { getDb, getParseResults, clearParseResults } from './db';
import { createTestDir, cleanupTestDir, createTestFile, waitFor } from '../parser/test-helpers';

describe('CodeParseManager Integration', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await createTestDir();
    getDb(); // Initialize database
  });

  afterEach(async () => {
    codeParseManager.stopAll();
    clearParseResults(testDir);
    await waitFor(100);
    await cleanupTestDir(testDir);
  });

  it('should monitor and store parse results', async () => {
    const file = await createTestFile(testDir, 'test.ts', 'const x = 1;');

    codeParseManager.startMonitoring(testDir);
    await waitFor(200);

    const fs = await import('fs/promises');
    await fs.writeFile(file, 'const x = 2;', 'utf8');
    await waitFor(300);

    const results = getParseResults(testDir);
    expect(results.length).toBeGreaterThan(0);
  });
});
