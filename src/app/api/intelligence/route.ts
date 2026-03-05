import { NextRequest, NextResponse } from 'next/server';
import { codeIntelligence } from '@/lib/code-intelligence';

export async function POST(req: NextRequest) {
  const { action, code, filePath, query } = await req.json();

  if (action === 'embed') {
    const vector = await codeIntelligence.embed(code, filePath);
    return NextResponse.json({ vector });
  }

  if (action === 'search') {
    const results = await codeIntelligence.search(query);
    return NextResponse.json({ results });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
