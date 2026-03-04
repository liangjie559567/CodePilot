import { taskScheduler } from '../src/scheduler/task-scheduler';
import { Task, TaskPriority, TaskStatus } from '../src/scheduler/types';

async function main() {
  console.log('🚀 Task Scheduler Test\n');

  const tasks: Task[] = [
    {
      id: '1',
      name: 'Low priority task',
      priority: TaskPriority.LOW,
      status: TaskStatus.PENDING,
      execute: async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('✅ Low priority task completed');
      },
      createdAt: Date.now(),
    },
    {
      id: '2',
      name: 'High priority task',
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING,
      execute: async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log('✅ High priority task completed');
      },
      createdAt: Date.now(),
    },
    {
      id: '3',
      name: 'Normal priority task',
      priority: TaskPriority.NORMAL,
      status: TaskStatus.PENDING,
      execute: async () => {
        await new Promise(resolve => setTimeout(resolve, 80));
        console.log('✅ Normal priority task completed');
      },
      createdAt: Date.now(),
    },
  ];

  console.log('📊 System metrics:');
  const metrics = taskScheduler.getMetrics();
  console.log(`   CPU: ${metrics.cpuUsage.toFixed(2)}`);
  console.log(`   Memory: ${metrics.memoryUsage.toFixed(2)}%\n`);

  console.log('📦 Adding tasks...');
  tasks.forEach(task => taskScheduler.addTask(task));

  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('\n🎉 Scheduler test complete!');
}

main().catch(console.error);
