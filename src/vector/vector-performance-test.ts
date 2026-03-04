/**
 * Vector Retrieval Performance Test
 */

import { generateEmbedding } from './embedding-engine';
import { FAISSIndex } from './faiss-index';

interface VectorTestResult {
  indexBuildTime: number;
  avgSearchTime: number;
  memoryUsed: number;
  accuracy: number;
}

export async function testVectorRetrieval(texts: string[]): Promise<VectorTestResult> {
  const index = new FAISSIndex();
  const startMem = process.memoryUsage().heapUsed;

  // Build index
  const buildStart = Date.now();
  for (let i = 0; i < texts.length; i++) {
    const vector = await generateEmbedding(texts[i]);
    index.add(vector, `file${i}.ts`, texts[i]);
  }
  const indexBuildTime = Date.now() - buildStart;

  // Test search
  const searchTimes: number[] = [];
  for (let i = 0; i < 10; i++) {
    const query = await generateEmbedding(texts[i]);
    const searchStart = Date.now();
    index.search(query, 5);
    searchTimes.push(Date.now() - searchStart);
  }

  const memoryUsed = (process.memoryUsage().heapUsed - startMem) / 1024 / 1024;

  return {
    indexBuildTime,
    avgSearchTime: searchTimes.reduce((a, b) => a + b) / searchTimes.length,
    memoryUsed,
    accuracy: 0.85, // Placeholder
  };
}
