// Vector DB Service - 向量搜索
export class VectorDBService {
  private vectors: Array<{ id: string; vector: number[]; metadata: any }> = [];

  addVector(id: string, vector: number[], metadata: any) {
    this.vectors.push({ id, vector, metadata });
  }

  search(query: number[], topK: number = 5) {
    return this.vectors
      .map(v => ({ ...v, score: this.cosineSimilarity(query, v.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }
}

export const vectorDBService = new VectorDBService();
