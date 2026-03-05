export class FAISSIndex {
  private dimension = 768;
  private vectors: number[][] = [];
  private metadata: Array<{ filePath: string; text: string }> = [];

  add(vector: number[], filePath: string, text: string): void {
    this.vectors.push(vector);
    this.metadata.push({ filePath, text });
  }

  search(query: number[], k = 10): Array<{ filePath: string; text: string; score: number }> {
    const results: Array<{ filePath: string; text: string; score: number; idx: number }> = [];
    
    for (let i = 0; i < this.vectors.length; i++) {
      const distance = this.euclideanDistance(query, this.vectors[i]);
      results.push({ ...this.metadata[i], score: distance, idx: i });
    }
    
    results.sort((a, b) => a.score - b.score);
    return results.slice(0, k).map(({ idx, ...rest }) => rest);
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }

  size(): number {
    return this.metadata.length;
  }

  serialize() {
    return { vectors: this.vectors, metadata: this.metadata };
  }

  deserialize(data: { vectors: number[][]; metadata: Array<{ filePath: string; text: string }> }) {
    this.vectors = data.vectors;
    this.metadata = data.metadata;
  }
}
