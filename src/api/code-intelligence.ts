import { inferenceService } from '../inference/inference-service';
import { vectorService } from '../vector/vector-service';
import { TaskType } from '../inference/types';

export interface CodeAnalysisRequest {
  code: string;
  filePath: string;
  language?: string;
}

export interface CodeSearchRequest {
  query: string;
  limit?: number;
}

export class CodeIntelligenceAPI {
  private static instance: CodeIntelligenceAPI;

  private constructor() {}

  static getInstance(): CodeIntelligenceAPI {
    if (!CodeIntelligenceAPI.instance) {
      CodeIntelligenceAPI.instance = new CodeIntelligenceAPI();
    }
    return CodeIntelligenceAPI.instance;
  }

  async initialize() {
    await inferenceService.initialize();
  }

  async analyzeCode(req: CodeAnalysisRequest) {
    const embedding = await inferenceService.infer({
      taskType: TaskType.CODE_EMBEDDING,
      input: req.code,
    });
    await vectorService.addDocument(req.code, req.filePath);
    return { embedding: embedding.output };
  }

  async searchCode(req: CodeSearchRequest) {
    return vectorService.search(req.query, req.limit || 10);
  }

  async completeCode(code: string) {
    return inferenceService.infer({
      taskType: TaskType.CODE_COMPLETION,
      input: code,
    });
  }

  async summarizeCode(code: string) {
    return inferenceService.infer({
      taskType: TaskType.CODE_SUMMARY,
      input: code,
    });
  }
}

export const codeIntelligenceAPI = CodeIntelligenceAPI.getInstance();
