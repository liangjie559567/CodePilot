/**
 * Code Intelligence Service - Server-side only
 */

export interface CodeEmbedding {
  vector: number[];
  text: string;
  filePath: string;
}

export class CodeIntelligence {
  private embeddings: CodeEmbedding[] = [];

  async embed(code: string, filePath: string): Promise<number[]> {
    // Simple hash-based embedding (placeholder)
    const vector = this.simpleHash(code);
    this.embeddings.push({ vector, text: code, filePath });
    return vector;
  }

  async search(query: string, limit = 5): Promise<CodeEmbedding[]> {
    const queryVector = this.simpleHash(query);
    return this.embeddings
      .map(e => ({ ...e, score: this.cosineSimilarity(queryVector, e.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private simpleHash(text: string): number[] {
    const vector = new Array(128).fill(0);
    for (let i = 0; i < text.length; i++) {
      vector[i % 128] += text.charCodeAt(i);
    }
    return vector;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const codeIntelligence = new CodeIntelligence();
