/**
 * FAISS Index - HNSW vector search
 */

import { IndexFlatL2 } from 'faiss-node';

export class FAISSIndex {
  private index: IndexFlatL2;
  private dimension = 768;
  private vectors: number[][] = [];
  private metadata: Array<{ filePath: string; text: string }> = [];

  constructor() {
    this.index = new IndexFlatL2(this.dimension);
  }

  add(vector: number[], filePath: string, text: string): void {
    this.index.add(vector);
    this.vectors.push(vector);
    this.metadata.push({ filePath, text });
  }

  search(query: number[], k = 10): Array<{ filePath: string; text: string; score: number }> {
    const result = this.index.search(query, k);
    return result.labels.map((idx, i) => ({
      ...this.metadata[idx],
      score: result.distances[i],
    }));
  }

  size(): number {
    return this.metadata.length;
  }
}
