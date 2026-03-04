import { NextResponse } from 'next/server';
import { initializeServices } from '@/lib/server-init';

export async function GET() {
  initializeServices();
  return NextResponse.json({
    status: 'ok',
    services: {
      codeParseService: 'ready'
    }
  });
}
