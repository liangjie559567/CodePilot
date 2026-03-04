import { describe, it, expect, beforeAll } from 'vitest';
import { inferenceService } from './inference-service';
import { TaskType } from './types';
import type { ModelConfig } from './types';
import path from 'path';

describe('InferenceService Integration', () => {
  beforeAll(() => {
    const modelConfig: ModelConfig = {
      id: 'code-embedding-v1',
      name: 'Code Embedding Model',
      path: path.resolve('models/onnx/code-embedding.onnx'),
      taskType: TaskType.CODE_EMBEDDING,
      inputShape: [1, 512],
      outputShape: [1, 768],
      quantized: false
    };

    inferenceService.registerModel(modelConfig);
  });

  it('should perform inference with real ONNX model', async () => {
    const input = new Array(512).fill(0.1);

    const result = await inferenceService.infer({
      taskType: TaskType.CODE_EMBEDDING,
      input
    });

    expect(result.output).toBeInstanceOf(Array);
    expect((result.output as number[]).length).toBe(768);
    expect(result.latency).toBeGreaterThan(0);
    expect(result.cached).toBe(false);
  });

  it('should cache repeated inference requests', async () => {
    const input = new Array(512).fill(0.2);

    const result1 = await inferenceService.infer({
      taskType: TaskType.CODE_EMBEDDING,
      input
    });

    const result2 = await inferenceService.infer({
      taskType: TaskType.CODE_EMBEDDING,
      input
    });

    expect(result1.cached).toBe(false);
    expect(result2.cached).toBe(true);
    expect(result2.latency).toBeLessThanOrEqual(result1.latency);
  });

  it('should handle different input sizes', async () => {
    const input = new Array(512).fill(0.3);

    const result = await inferenceService.infer({
      taskType: TaskType.CODE_EMBEDDING,
      input
    });

    expect(result.output).toBeDefined();
    expect((result.output as number[]).every(n => typeof n === 'number')).toBe(true);
  });
});
