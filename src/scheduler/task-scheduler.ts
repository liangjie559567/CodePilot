import { Task, TaskPriority, TaskStatus, ResourceMetrics } from './types';
import os from 'os';

export class TaskScheduler {
  private static instance: TaskScheduler;
  private queue: Task[] = [];
  private running: Map<string, Task> = new Map();
  private completed: Set<string> = new Set();
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

  private canRun(task: Task): boolean {
    if (!task.dependencies) return true;
    return task.dependencies.every(dep => this.completed.has(dep));
  }

  private async schedule(): Promise<void> {
    while (this.running.size < this.maxConcurrent) {
      const task = this.queue.find(t => this.canRun(t));
      if (!task) break;

      this.queue = this.queue.filter(t => t.id !== task.id);
      this.running.set(task.id, task);
      task.status = TaskStatus.RUNNING;

      task.execute()
        .then(() => {
          task.status = TaskStatus.COMPLETED;
          this.completed.add(task.id);
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

  getStatus() {
    return {
      queued: this.queue.length,
      running: this.running.size,
      completed: this.completed.size,
    };
  }
}

export const taskScheduler = TaskScheduler.getInstance();
