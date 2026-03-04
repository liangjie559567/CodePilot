import * as fs from 'fs/promises';
import * as path from 'path';

export async function createTestDir(): Promise<string> {
  const dir = path.join(process.cwd(), `test-temp-${Date.now()}`);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function cleanupTestDir(dir: string): Promise<void> {
  await fs.rm(dir, { recursive: true, force: true });
}

export async function createTestFile(
  dir: string,
  filename: string,
  content: string
): Promise<string> {
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, content, 'utf8');
  return filePath;
}

export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; time: number }> {
  const start = performance.now();
  const result = await fn();
  const time = performance.now() - start;
  return { result, time };
}
