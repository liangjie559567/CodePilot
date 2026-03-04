import { inferenceService } from '../inference/inference-service';
import { TaskType } from '../inference/types';
import { FAISSIndex } from './faiss-index';

export class VectorService {
  private static instance: VectorService;
  private index = new FAISSIndex();

  private constructor() {}

  static getInstance(): VectorService {
    if (!VectorService.instance) {
      VectorService.instance = new VectorService();
    }
    return VectorService.instance;
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
}

export const vectorService = VectorService.getInstance();
