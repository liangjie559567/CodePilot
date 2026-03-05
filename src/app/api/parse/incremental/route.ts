import { NextRequest, NextResponse } from 'next/server';
import { codeParseService } from '@/services/code-parse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await codeParseService.parseIncremental(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Parse failed' }, { status: 500 });
  }
}
