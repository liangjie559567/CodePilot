export enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Task {
  id: string;
  priority: number;
  status: TaskStatus;
  execute: () => Promise<void>;
  dependencies?: string[];
}

export interface ResourceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  availableMemory: number;
}
