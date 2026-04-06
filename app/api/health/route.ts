import { NextResponse } from 'next/server';

import { createLogger } from '@/lib/logger';
import prisma from '@/lib/prisma';

const logger = createLogger('health');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('DB ping failed', error);
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}
