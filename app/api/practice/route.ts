import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, AuthError, authErrorResponse } from '@/lib/api-auth';

// List the current user's own sales-practice sessions.
export async function GET(request: Request) {
  try {
    const session = await requireUser(request);
    const sessions = await prisma.practiceSession.findMany({
      where: { userId: session.id },
      orderBy: { id: 'desc' },
      take: 50,
    });
    return NextResponse.json(sessions);
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Practice GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch practice sessions' }, { status: 500 });
  }
}

// Save a completed practice session for the current user.
export async function POST(request: Request) {
  try {
    const session = await requireUser(request);
    const { persona, personaName, product, score, feedback, stageScores } = await request.json();

    const created = await prisma.practiceSession.create({
      data: {
        userId: session.id,
        persona: String(persona || 'unknown'),
        personaName: personaName ? String(personaName) : null,
        product: product ? String(product) : null,
        score: Math.min(100, Math.max(0, Number(score) || 0)),
        stageScores: stageScores && typeof stageScores === 'object' ? stageScores : undefined,
        feedback: feedback ? String(feedback) : null,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Practice POST error:', error);
    return NextResponse.json({ error: 'Failed to save practice session' }, { status: 500 });
  }
}
