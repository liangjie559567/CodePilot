import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { aiInferenceService } = await import('@/server/ai-inference');
  const { code, position } = await req.json();
  const result = await aiInferenceService.complete(code, position);
  return NextResponse.json({ completion: result });
}
