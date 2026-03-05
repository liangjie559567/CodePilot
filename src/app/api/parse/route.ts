import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { codeParseService } = await import('@/server/code-parse');
  const { file, content } = await req.json();
  const result = codeParseService.parseIncremental(file, content);
  return NextResponse.json(result);
}
