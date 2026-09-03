import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, AuthError, authErrorResponse } from '@/lib/api-auth';
import { tashkentDay, getFreeDailyLimit, effectiveLimit } from '@/lib/limits';

// Superadmin: today's simulator usage per user (sessions, tokens, plan, limit).
export async function GET(request: Request) {
  try {
    await requireRole(request, 'superadmin');
    const day = tashkentDay();
    const freeLimit = await getFreeDailyLimit();

    const [rows, totals] = await Promise.all([
      prisma.simulatorUsage.findMany({
        where: { day },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, plan: true, dailyLimitOverride: true } } },
        orderBy: { sessions: 'desc' },
      }),
      prisma.simulatorUsage.aggregate({ where: { day }, _sum: { sessions: true, tokens: true } }),
    ]);

    const users = rows
      .filter(r => r.user)
      .map(r => ({
        userId: r.userId,
        name: `${r.user!.firstName} ${r.user!.lastName}`,
        email: r.user!.email,
        plan: r.user!.plan,
        sessions: r.sessions,
        tokens: r.tokens,
        limit: effectiveLimit(r.user!, freeLimit),
      }));

    return NextResponse.json({
      day,
      freeLimit,
      totalSessions: totals._sum.sessions ?? 0,
      totalTokens: totals._sum.tokens ?? 0,
      users,
    });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('simulator/usage error:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
