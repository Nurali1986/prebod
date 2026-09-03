import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, AuthError, authErrorResponse } from '@/lib/api-auth';

// A rep's current team (if any).
export async function GET(request: Request) {
  try {
    const session = await requireUser(request);
    const me = await prisma.user.findUnique({
      where: { id: session.id },
      select: { team: { select: { name: true, joinCode: true } } },
    });
    return NextResponse.json({ team: me?.team || null });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

// Join a team by its code (reps).
export async function POST(request: Request) {
  try {
    const session = await requireUser(request);
    const { code } = await request.json();
    if (!code?.trim()) return NextResponse.json({ error: 'Kodni kiriting' }, { status: 400 });

    const team = await prisma.team.findUnique({ where: { joinCode: String(code).trim().toUpperCase() } });
    if (!team) return NextResponse.json({ error: 'Bunday kodli jamoa topilmadi' }, { status: 404 });
    if (team.managerId === session.id) {
      return NextResponse.json({ error: 'O\'z jamoangizga qo\'shila olmaysiz' }, { status: 400 });
    }

    await prisma.user.update({ where: { id: session.id }, data: { teamId: team.id } });
    return NextResponse.json({ success: true, teamName: team.name });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Team join error:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
