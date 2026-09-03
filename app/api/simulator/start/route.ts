import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, AuthError, authErrorResponse } from '@/lib/api-auth';
import { tashkentDay, getFreeDailyLimit, effectiveLimit } from '@/lib/limits';

// Called when a user starts a new practice conversation. Enforces the daily
// free limit server-side and atomically counts the session. Returns 402 when
// the quota is exhausted so the client can show the paywall.
export async function POST(request: Request) {
  try {
    const session = await requireUser(request);
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { plan: true, dailyLimitOverride: true },
    });
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const freeLimit = await getFreeDailyLimit();
    const limit = effectiveLimit(user, freeLimit);
    const day = tashkentDay();

    const existing = await prisma.simulatorUsage.findUnique({
      where: { userId_day: { userId: session.id, day } },
    });
    const used = existing?.sessions ?? 0;

    if (used >= limit) {
      return NextResponse.json(
        { error: 'daily_limit_reached', limit, used, plan: user.plan },
        { status: 402 },
      );
    }

    const updated = await prisma.simulatorUsage.upsert({
      where: { userId_day: { userId: session.id, day } },
      create: { userId: session.id, day, sessions: 1, tokens: 0 },
      update: { sessions: { increment: 1 } },
    });

    return NextResponse.json({
      ok: true,
      used: updated.sessions,
      limit,
      remaining: Math.max(0, limit - updated.sessions),
      plan: user.plan,
    });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('simulator/start error:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

// Lightweight status check (no increment) — used to render the remaining count.
export async function GET(request: Request) {
  try {
    const session = await requireUser(request);
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { plan: true, dailyLimitOverride: true },
    });
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const freeLimit = await getFreeDailyLimit();
    const limit = effectiveLimit(user, freeLimit);
    const day = tashkentDay();
    const existing = await prisma.simulatorUsage.findUnique({
      where: { userId_day: { userId: session.id, day } },
    });
    const used = existing?.sessions ?? 0;
    return NextResponse.json({ used, limit, remaining: Math.max(0, limit - used), plan: user.plan });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
