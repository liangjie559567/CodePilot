import { describe, it, expect, beforeAll } from 'vitest';
import { vectorService } from '../../vector/vector-service';
import { taskScheduler } from '../../scheduler/task-scheduler';
import { inferenceService } from '../../inference/inference-service';
import { TaskStatus } from '../../scheduler/types';

describe('Phase 3 Integration Tests', () => {
  beforeAll(async () => {
    await inferenceService.initialize();
    await vectorService.initialize();
  });

  describe('Vector Service', () => {
    it('should add and search documents', async () => {
      await vectorService.addDocument('function add(a, b) { return a + b; }', 'math.ts');
      await vectorService.addDocument('function multiply(x, y) { return x * y; }', 'calc.ts');

      const results = await vectorService.search('addition function', 1);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].filePath).toBe('math.ts');
    }, 30000);

    it('should handle batch operations', async () => {
      await vectorService.addBatch([
        { text: 'const x = 1;', filePath: 'a.ts' },
        { text: 'const y = 2;', filePath: 'b.ts' },
      ]);
      expect(vectorService.size()).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Task Scheduler', () => {
    it('should execute tasks with dependencies', async () => {
      const results: string[] = [];

      taskScheduler.addTask({
        id: 'task1',
        priority: 1,
        status: TaskStatus.PENDING,
        execute: async () => { results.push('task1'); },
      });

      taskScheduler.addTask({
        id: 'task2',
        priority: 1,
        status: TaskStatus.PENDING,
        dependencies: ['task1'],
        execute: async () => { results.push('task2'); },
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(results).toEqual(['task1', 'task2']);
    });

    it('should report status', () => {
      const status = taskScheduler.getStatus();
      expect(status).toHaveProperty('queued');
      expect(status).toHaveProperty('running');
      expect(status).toHaveProperty('completed');
    });
  });
});
