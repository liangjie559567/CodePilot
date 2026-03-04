import { Task, TaskPriority, TaskStatus, ResourceMetrics } from './types';
import os from 'os';

export class TaskScheduler {
  private static instance: TaskScheduler;
  private queue: Task[] = [];
  private running: Set<string> = new Set();
  private maxConcurrent = 3;

  private constructor() {}

  static getInstance(): TaskScheduler {
    if (!TaskScheduler.instance) {
      TaskScheduler.instance = new TaskScheduler();
    }
    return TaskScheduler.instance;
  }

  addTask(task: Task): void {
    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority);
    this.schedule();
  }

  private async schedule(): Promise<void> {
    while (this.running.size < this.maxConcurrent && this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      this.running.add(task.id);
      task.status = TaskStatus.RUNNING;

      task.execute()
        .then(() => {
          task.status = TaskStatus.COMPLETED;
        })
        .catch(() => {
          task.status = TaskStatus.FAILED;
        })
        .finally(() => {
          this.running.delete(task.id);
          this.schedule();
        });
    }
  }

  getMetrics(): ResourceMetrics {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    return {
      cpuUsage: os.loadavg()[0] / os.cpus().length,
      memoryUsage: ((totalMem - freeMem) / totalMem) * 100,
      availableMemory: freeMem,
    };
  }
}

export const taskScheduler = TaskScheduler.getInstance();
