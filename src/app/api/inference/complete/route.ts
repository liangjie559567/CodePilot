import { NextRequest, NextResponse } from 'next/server';
import { aiInferenceService } from '@/services/ai-inference';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await aiInferenceService.complete(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Inference failed' }, { status: 500 });
  }
}
