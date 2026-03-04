/**
 * POC Performance Test Script
 */

import { parseFile, getCachedTree } from './tree-sitter-engine';
import { SymbolIndex } from './symbol-index';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  projectName: string;
  fileCount: number;
  totalTime: number;
  avgTimePerFile: number;
  memoryUsed: number;
  incrementalUpdateTime?: number;
}

async function testProject(projectPath: string): Promise<TestResult> {
  const files = getAllFiles(projectPath);
  const startMem = process.memoryUsage().heapUsed;
  const startTime = Date.now();

  for (const file of files) {
    await parseFile(file);
  }

  const totalTime = Date.now() - startTime;
  const memoryUsed = (process.memoryUsage().heapUsed - startMem) / 1024 / 1024;

  return {
    projectName: path.basename(projectPath),
    fileCount: files.length,
    totalTime,
    avgTimePerFile: totalTime / files.length,
    memoryUsed,
  };
}

function getAllFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else if (/\.(ts|tsx|js|jsx|py)$/.test(item)) {
      files.push(fullPath);
    }
  }

  return files;
}

export { testProject };
