'use server';

interface VectorItem {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
}

interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

class VectorDBService {
  private index = new Map<string, VectorItem>();

  async buildIndex(vectors: VectorItem[]): Promise<{ indexId: string; vectorCount: number; buildTime: number }> {
    const start = Date.now();
    vectors.forEach(v => this.index.set(v.id, v));
    return {
      indexId: `idx_${Date.now()}`,
      vectorCount: vectors.length,
      buildTime: Date.now() - start,
    };
  }

  async search(query: number[], k: number): Promise<{ results: SearchResult[]; searchTime: number }> {
    const start = Date.now();
    const results: SearchResult[] = [];

    for (const [id, item] of this.index) {
      const score = this.cosineSimilarity(query, item.vector);
      results.push({ id, score, metadata: item.metadata });
    }

    results.sort((a, b) => b.score - a.score);
    return {
      results: results.slice(0, k),
      searchTime: Date.now() - start,
    };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }
}

export const vectorDBService = new VectorDBService();
