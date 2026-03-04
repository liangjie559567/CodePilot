import { describe, it, expect, beforeEach } from 'vitest';
import { ModelRegistry } from './model-registry';
import { TaskRouter } from './task-router';
import { ResultCache } from './result-cache';
import { TaskType, ModelConfig } from './types';

describe('ModelRegistry', () => {
  let registry: ModelRegistry;

  beforeEach(() => {
    registry = new ModelRegistry();
  });

  it('should register and retrieve models', () => {
    const config: ModelConfig = {
      id: 'test-model',
      name: 'Test Model',
      path: '/path/to/model.onnx',
      taskType: TaskType.CODE_EMBEDDING,
      inputShape: [1, 512],
      outputShape: [1, 768],
      quantized: false
    };

    registry.register(config);
    const retrieved = registry.get('test-model');

    expect(retrieved).toEqual(config);
  });

  it('should get models by task type', () => {
    const config: ModelConfig = {
      id: 'embedding-model',
      name: 'Embedding Model',
      path: '/path/to/model.onnx',
      taskType: TaskType.CODE_EMBEDDING,
      inputShape: [1, 512],
      outputShape: [1, 768],
      quantized: false
    };

    registry.register(config);
    const models = registry.getByTaskType(TaskType.CODE_EMBEDDING);

    expect(models).toHaveLength(1);
    expect(models[0].id).toBe('embedding-model');
  });
});

describe('TaskRouter', () => {
  it('should select model for task type', () => {
    const registry = new ModelRegistry();
    const config: ModelConfig = {
      id: 'test-model',
      name: 'Test Model',
      path: '/path/to/model.onnx',
      taskType: TaskType.CODE_EMBEDDING,
      inputShape: [1, 512],
      outputShape: [1, 768],
      quantized: false
    };

    registry.register(config);
    const router = new TaskRouter(registry);
    const selected = router.selectModel(TaskType.CODE_EMBEDDING);

    expect(selected.id).toBe('test-model');
  });

  it('should throw error if no model found', () => {
    const registry = new ModelRegistry();
    const router = new TaskRouter(registry);

    expect(() => router.selectModel(TaskType.CODE_EMBEDDING))
      .toThrow('No model found');
  });
});

describe('ResultCache', () => {
  let cache: ResultCache;

  beforeEach(() => {
    cache = new ResultCache();
  });

  it('should cache and retrieve results', () => {
    const request = {
      taskType: TaskType.CODE_EMBEDDING,
      input: 'test code'
    };

    const result = {
      output: [1, 2, 3],
      latency: 100,
      cached: false
    };

    const key = cache.generateKey(request);
    cache.set(key, result);
    const retrieved = cache.get(key);

    expect(retrieved).toEqual(result);
  });

  it('should return undefined for cache miss', () => {
    const key = 'non-existent-key';
    const result = cache.get(key);

    expect(result).toBeUndefined();
  });
});
