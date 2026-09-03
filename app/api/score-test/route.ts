import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, AuthError, authErrorResponse } from '@/lib/api-auth';

// Scores a candidate's test answers on the server so the correct-answer keys
// are never exposed to the client. Body: { vacancyId, answers: { [index]: optionIndex } }.
export async function POST(request: Request) {
  try {
    await requireRole(request, 'candidate');
    const { vacancyId, answers } = await request.json();

    const tests = await prisma.vacancyTest.findMany({
      where: { vacancyId: Number(vacancyId) },
      orderBy: { id: 'asc' },
    });
    if (tests.length === 0) return NextResponse.json({ score: 0, total: 0, correct: 0 });

    let correct = 0;
    tests.forEach((t, i) => {
      if (answers && answers[i] === t.correct) correct++;
    });
    const score = Math.round((correct / tests.length) * 100);
    return NextResponse.json({ score, total: tests.length, correct });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('score-test error:', error);
    return NextResponse.json({ error: 'Failed to score test' }, { status: 500 });
  }
}
