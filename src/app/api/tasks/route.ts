import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { taskSchedulerService, TaskPriority } = await import('@/server/task-scheduler');
  const { id, priority, action } = await req.json();
  taskSchedulerService.submit(id, priority || TaskPriority.NORMAL, async () => {
    console.log(`Executing task: ${action}`);
  });
  return NextResponse.json({ status: 'submitted', id });
}
