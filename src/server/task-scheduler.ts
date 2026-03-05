// Task Scheduler Service - 任务调度
export enum TaskPriority { LOW = 0, NORMAL = 1, HIGH = 2 }
export enum TaskStatus { PENDING = 'pending', RUNNING = 'running', COMPLETED = 'completed', FAILED = 'failed' }

interface Task {
  id: string;
  priority: TaskPriority;
  status: TaskStatus;
  execute: () => Promise<void>;
}

export class TaskSchedulerService {
  private queue: Task[] = [];
  private running = false;

  submit(id: string, priority: TaskPriority, execute: () => Promise<void>) {
    this.queue.push({ id, priority, status: TaskStatus.PENDING, execute });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.process();
  }

  private async process() {
    if (this.running || this.queue.length === 0) return;
    this.running = true;
    const task = this.queue.shift()!;
    task.status = TaskStatus.RUNNING;
    try {
      await task.execute();
      task.status = TaskStatus.COMPLETED;
    } catch {
      task.status = TaskStatus.FAILED;
    }
    this.running = false;
    this.process();
  }
}

export const taskSchedulerService = new TaskSchedulerService();
