import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, AuthError, authErrorResponse } from '@/lib/api-auth';

// Superadmin-only: list users.
export async function GET(request: Request) {
  try {
    await requireRole(request, 'superadmin');
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true, firstName: true, lastName: true, email: true,
        phone: true, role: true, company: true, blocked: true, createdAt: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Users GET error:', error);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

// Superadmin-only: block/unblock, set plan (premium), or per-user daily limit.
export async function PATCH(request: Request) {
  try {
    const session = await requireRole(request, 'superadmin');
    const { id, blocked, plan, dailyLimitOverride } = await request.json();
    if (!id) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const data: any = {};
    if (blocked !== undefined) {
      if (id === session.id) {
        return NextResponse.json({ error: 'O\'zingizni bloklay olmaysiz' }, { status: 400 });
      }
      data.blocked = Boolean(blocked);
    }
    if (plan !== undefined) {
      if (plan !== 'free' && plan !== 'premium') {
        return NextResponse.json({ error: 'Noto\'g\'ri tarif' }, { status: 400 });
      }
      data.plan = plan;
    }
    if (dailyLimitOverride !== undefined) {
      data.dailyLimitOverride = dailyLimitOverride === null ? null : Math.max(0, Math.min(1000, Number(dailyLimitOverride) || 0));
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, blocked: true, plan: true, dailyLimitOverride: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Users PATCH error:', error);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
