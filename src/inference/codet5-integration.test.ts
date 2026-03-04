import { describe, it, expect, beforeAll } from 'vitest';
import { inferenceService } from './inference-service';
import { TaskType } from './types';

describe('CodeT5+ Integration', () => {
  beforeAll(async () => {
    await inferenceService.initialize();
  });

  it('should route to Fast model for short completion', async () => {
    const result = await inferenceService.infer({
      taskType: TaskType.CODE_COMPLETION,
      input: 'function add(a, b) {',
      options: { latencyBudget: 50 },
    });

    expect(result.latency).toBeLessThan(100);
  });

  it('should route to Standard model for medium completion', async () => {
    const code = 'function '.repeat(50);
    const result = await inferenceService.infer({
      taskType: TaskType.CODE_COMPLETION,
      input: code,
    });

    expect(result.latency).toBeLessThan(500);
  });

  it('should route to Premium model for long summary', async () => {
    const code = 'function '.repeat(200);
    const result = await inferenceService.infer({
      taskType: TaskType.CODE_SUMMARY,
      input: code,
    });

    expect(result.latency).toBeLessThan(1000);
    expect(typeof result.output).toBe('string');
  });

  it('should handle all three task types', async () => {
    const tasks = [
      TaskType.CODE_EMBEDDING,
      TaskType.CODE_COMPLETION,
      TaskType.CODE_SUMMARY,
    ];

    for (const taskType of tasks) {
      const result = await inferenceService.infer({
        taskType,
        input: 'function test() {}',
      });

      expect(result).toBeDefined();
      expect(result.latency).toBeGreaterThan(0);
    }
  });
});
