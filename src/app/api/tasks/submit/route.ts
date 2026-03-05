import { NextRequest, NextResponse } from 'next/server';
import { taskSchedulerService } from '@/services/task-scheduler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const taskId = await taskSchedulerService.submitTask(body.type, body.payload, body.priority);
    return NextResponse.json({ taskId });
  } catch (error) {
    return NextResponse.json({ error: 'Task submission failed' }, { status: 500 });
  }
}
