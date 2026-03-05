import { describe, it, expect, beforeAll } from 'vitest';
import { inferenceService } from '../../inference/inference-service';
import { TaskType } from '../../inference/types';

describe('Inference Integration', () => {
  beforeAll(async () => {
    await inferenceService.initialize();
  });

  it('should generate code embedding', async () => {
    const result = await inferenceService.infer({
      taskType: TaskType.CODE_EMBEDDING,
      input: 'function hello() { return "world"; }'
    });

    expect(result.output).toBeDefined();
    expect(Array.isArray(result.output)).toBe(true);
    expect(result.latency).toBeGreaterThan(0);
  }, 30000);

  it('should use cache for repeated requests', async () => {
    const input = 'const x = 42;';

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
  }, 30000);
});
