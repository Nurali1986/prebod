import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, AuthError, authErrorResponse } from '@/lib/api-auth';

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

// Manager's team + leaderboard of member reps. Creates the team lazily.
export async function GET(request: Request) {
  try {
    const session = await requireRole(request, 'manager', 'superadmin');

    let team = await prisma.team.findUnique({ where: { managerId: session.id } });
    if (!team) {
      const me = await prisma.user.findUnique({ where: { id: session.id }, select: { company: true } });
      // Generate a unique join code.
      let code = genCode();
      for (let i = 0; i < 5; i++) {
        const exists = await prisma.team.findUnique({ where: { joinCode: code } });
        if (!exists) break;
        code = genCode();
      }
      team = await prisma.team.create({
        data: { name: me?.company || 'Mening jamoam', joinCode: code, managerId: session.id },
      });
    }

    const members = await prisma.user.findMany({
      where: { teamId: team.id },
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
    });
    const memberIds = members.map((m) => m.id);

    const stats = memberIds.length
      ? await prisma.practiceSession.groupBy({
          by: ['userId'],
          where: { userId: { in: memberIds } },
          _count: { _all: true },
          _avg: { score: true },
          _max: { score: true, createdAt: true },
        })
      : [];
    const byUser: Record<number, any> = {};
    stats.forEach((s) => { byUser[s.userId] = s; });

    const leaderboard = members.map((m) => {
      const s = byUser[m.id];
      return {
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        email: m.email,
        sessions: s?._count._all ?? 0,
        avg: s?._avg.score != null ? Math.round(s._avg.score) : null,
        best: s?._max.score ?? null,
        last: s?._max.createdAt ?? null,
      };
    }).sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));

    return NextResponse.json({
      team: { name: team.name, joinCode: team.joinCode, product: team.product, scriptText: team.scriptText },
      leaderboard,
    });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Team GET error:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

// Manager updates the team's product and custom sales script.
export async function PATCH(request: Request) {
  try {
    const session = await requireRole(request, 'manager', 'superadmin');
    const { name, product, scriptText } = await request.json();
    const team = await prisma.team.findUnique({ where: { managerId: session.id } });
    if (!team) return NextResponse.json({ error: 'Jamoa topilmadi' }, { status: 404 });

    const data: any = {};
    if (name !== undefined) data.name = String(name).trim() || team.name;
    if (product !== undefined) data.product = product ? String(product).trim() : null;
    if (scriptText !== undefined) data.scriptText = scriptText ? String(scriptText) : null;

    const updated = await prisma.team.update({ where: { id: team.id }, data });
    return NextResponse.json({ name: updated.name, product: updated.product, scriptText: updated.scriptText });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Team PATCH error:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
