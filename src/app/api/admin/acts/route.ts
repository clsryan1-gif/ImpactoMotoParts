import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { user, role, type, detail, metadata } = await req.json();

    const log = await prisma.activityLog.create({
      data: {
        user,
        role,
        type,
        detail,
        metadata,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error('[ACTIVITY_LOG_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const logs = await prisma.activityLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 500,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('[ACTIVITY_LOG_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
