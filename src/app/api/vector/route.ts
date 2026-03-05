import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { vectorDBService } = await import('@/server/vector-db');
  const { query, topK } = await req.json();
  const results = vectorDBService.search(query, topK);
  return NextResponse.json({ results });
}
