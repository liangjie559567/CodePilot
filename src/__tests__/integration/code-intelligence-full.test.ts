import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { inferenceService } from '../../inference/inference-service';
import { TaskType } from '../../inference/types';

describe('Code Intelligence - Full Integration', () => {
  beforeAll(async () => {
    await inferenceService.initialize();
  });

  afterAll(() => {
    inferenceService.dispose();
  });

  describe('Code Embedding', () => {
    it('should generate embeddings for JavaScript code', async () => {
      const result = await inferenceService.infer({
        taskType: TaskType.CODE_EMBEDDING,
        input: 'function add(a, b) { return a + b; }'
      });

      expect(result.output).toBeDefined();
      expect(Array.isArray(result.output)).toBe(true);
      expect((result.output as number[]).length).toBe(768);
      expect(result.cached).toBe(false);
    }, 30000);

    it('should generate embeddings for TypeScript code', async () => {
      const result = await inferenceService.infer({
        taskType: TaskType.CODE_EMBEDDING,
        input: 'const greet = (name: string): string => `Hello, ${name}`;'
      });

      expect(result.output).toBeDefined();
      expect(Array.isArray(result.output)).toBe(true);
    }, 30000);

    it('should generate different embeddings for different code', async () => {
      const result1 = await inferenceService.infer({
        taskType: TaskType.CODE_EMBEDDING,
        input: 'function foo() { return 1; }'
      });

      const result2 = await inferenceService.infer({
        taskType: TaskType.CODE_EMBEDDING,
        input: 'function bar() { return 2; }'
      });

      expect(result1.output).not.toEqual(result2.output);
    }, 30000);
  });

  describe('Caching', () => {
    it('should cache results for identical inputs', async () => {
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
      expect(result1.output).toEqual(result2.output);
    }, 30000);
  });

  describe('Performance', () => {
    it('should complete inference within reasonable time', async () => {
      const start = Date.now();
      
      await inferenceService.infer({
        taskType: TaskType.CODE_EMBEDDING,
        input: 'function test() { console.log("hello"); }'
      });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // 5 seconds max
    }, 30000);
  });
});
