import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, AuthError, authErrorResponse } from '@/lib/api-auth';
import { getFreeDailyLimit } from '@/lib/limits';

// Superadmin: read platform settings.
export async function GET(request: Request) {
  try {
    await requireRole(request, 'superadmin');
    const freeDailyLimit = await getFreeDailyLimit();
    return NextResponse.json({ freeDailyLimit });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

// Superadmin: update platform settings (currently the free daily simulator limit).
export async function PATCH(request: Request) {
  try {
    await requireRole(request, 'superadmin');
    const { freeDailyLimit } = await request.json();

    if (freeDailyLimit != null) {
      const n = parseInt(String(freeDailyLimit), 10);
      if (!Number.isFinite(n) || n < 0 || n > 1000) {
        return NextResponse.json({ error: 'Limit 0–1000 oralig\'ida bo\'lishi kerak' }, { status: 400 });
      }
      await prisma.setting.upsert({
        where: { key: 'freeDailyLimit' },
        create: { key: 'freeDailyLimit', value: String(n) },
        update: { value: String(n) },
      });
    }

    const updated = await getFreeDailyLimit();
    return NextResponse.json({ freeDailyLimit: updated });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('settings PATCH error:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
