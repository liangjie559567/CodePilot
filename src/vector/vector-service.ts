import { inferenceService } from '../inference/inference-service';
import { TaskType } from '../inference/types';
import { FAISSIndex } from './faiss-index';
import * as fs from 'fs/promises';
import * as path from 'path';

export class VectorService {
  private static instance: VectorService;
  private index = new FAISSIndex();
  private indexPath = path.join(process.cwd(), 'data', 'vector-index.json');

  private constructor() {}

  static getInstance(): VectorService {
    if (!VectorService.instance) {
      VectorService.instance = new VectorService();
    }
    return VectorService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.load();
    } catch {
      // Index doesn't exist yet
    }
  }

  async addDocument(text: string, filePath: string): Promise<void> {
    const result = await inferenceService.infer({
      taskType: TaskType.CODE_EMBEDDING,
      input: text,
    });

    if (Array.isArray(result.output)) {
      this.index.add(result.output, filePath, text);
    }
  }

  async addBatch(documents: Array<{ text: string; filePath: string }>): Promise<void> {
    for (const doc of documents) {
      await this.addDocument(doc.text, doc.filePath);
    }
  }

  async search(query: string, k = 10) {
    const result = await inferenceService.infer({
      taskType: TaskType.CODE_EMBEDDING,
      input: query,
    });

    if (Array.isArray(result.output)) {
      const actualK = Math.min(k, this.index.size());
      return actualK > 0 ? this.index.search(result.output, actualK) : [];
    }
    return [];
  }

  async save(): Promise<void> {
    await fs.mkdir(path.dirname(this.indexPath), { recursive: true });
    await fs.writeFile(this.indexPath, JSON.stringify(this.index.serialize()));
  }

  async load(): Promise<void> {
    const data = await fs.readFile(this.indexPath, 'utf-8');
    this.index.deserialize(JSON.parse(data));
  }

  size(): number {
    return this.index.size();
  }
}

export const vectorService = VectorService.getInstance();
