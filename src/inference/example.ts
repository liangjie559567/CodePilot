import { inferenceService, TaskType, ModelTier } from './index';
import type { ModelConfig } from './index';
import path from 'path';

// 初始化模型
export function initializeInferenceModels() {
  const embeddingModel: ModelConfig = {
    id: 'code-embedding-v1',
    name: 'Code Embedding Model',
    path: path.resolve('models/onnx/code-embedding.onnx'),
    taskTypes: [TaskType.CODE_EMBEDDING],
    tier: ModelTier.STANDARD,
    inputShape: [1, 512],
    outputShape: [1, 768],
    quantized: false,
    maxTokens: 512
  };

  inferenceService.registerModel(embeddingModel);
}

// 使用示例
export async function getCodeEmbedding(code: string): Promise<number[]> {
  // 简化的 tokenization（实际应用中需要真实的 tokenizer）
  const tokens = new Array(512).fill(0);

  const result = await inferenceService.infer({
    taskType: TaskType.CODE_EMBEDDING,
    input: tokens
  });

  return result.output as number[];
}
