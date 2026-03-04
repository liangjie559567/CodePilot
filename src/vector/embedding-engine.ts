/**
 * Embedding Engine - Generate 768-dim vectors using Transformers.js
 */

import { pipeline } from '@xenova/transformers';
import { validateVector } from '../parser/security-validator';

let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  const vector = Array.from(output.data);
  validateVector(vector);
  return vector;
}
