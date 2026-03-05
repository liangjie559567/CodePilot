import { NextRequest, NextResponse } from 'next/server';
import { vectorDBService } from '@/services/vector-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await vectorDBService.search(body.query, body.k);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
