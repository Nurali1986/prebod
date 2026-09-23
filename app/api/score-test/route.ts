import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, AuthError, authErrorResponse } from '@/lib/api-auth';

export async function POST(request: Request) {
  try {
    await requireRole(request, 'sales');
    const { vacancyId, answers, testIds } = await request.json();

    const tests = await prisma.vacancyTest.findMany({
      where: { vacancyId: Number(vacancyId) },
      orderBy: { id: 'asc' },
    });
    if (tests.length === 0) return NextResponse.json({ score: 0, total: 0, correct: 0 });

    let correct = 0;
    let total = tests.length;

    if (Array.isArray(testIds) && testIds.length > 0) {
      total = testIds.length;
      testIds.forEach((tid: number, i: number) => {
        const t = tests.find(x => x.id === tid);
        if (t && answers && answers[i] === t.correct) correct++;
      });
    } else {
      tests.forEach((t, i) => {
        if (answers && answers[i] === t.correct) correct++;
      });
    }

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return NextResponse.json({ score, total, correct });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('score-test error:', error);
    return NextResponse.json({ error: 'Failed to score test' }, { status: 500 });
  }
}
