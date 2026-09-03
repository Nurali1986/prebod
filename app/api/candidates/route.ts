import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, requireRole, AuthError, authErrorResponse } from '@/lib/api-auth';

// Candidate's own applications, or (superadmin) every application on the platform.
export async function GET(request: Request) {
  try {
    const session = await requireUser(request);
    const { searchParams } = new URL(request.url);

    if (searchParams.get('all')) {
      if (session.role !== 'superadmin') {
        return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
      }
      const all = await prisma.candidate.findMany({
        include: {
          openAnswers: true,
          candidateUser: { select: { email: true } },
          vacancy: { select: { title: true, employer: { select: { company: true } } } },
        },
        orderBy: { id: 'desc' },
      });
      return NextResponse.json(all);
    }

    if (searchParams.get('mine')) {
      const applications = await prisma.candidate.findMany({
        where: { candidateUserId: session.id },
        include: {
          openAnswers: true,
          vacancy: {
            include: { department: true, vacancyTests: true, vacancyOpenQs: true },
          },
        },
        orderBy: { id: 'desc' },
      });
      return NextResponse.json(applications);
    }
    return NextResponse.json({ error: 'Unsupported query' }, { status: 400 });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Candidates GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(request, 'candidate');
    const body = await request.json();

    const vacancy = await prisma.vacancy.findUnique({ where: { id: body.vacancyId } });
    if (!vacancy) return NextResponse.json({ error: 'Vakansiya topilmadi' }, { status: 404 });

    // Prevent duplicate applications to the same vacancy by the same user.
    const existing = await prisma.candidate.findFirst({
      where: { candidateUserId: session.id, vacancyId: vacancy.id },
    });
    if (existing) {
      return NextResponse.json({ error: 'Siz bu vakansiyaga allaqachon ariza topshirgansiz' }, { status: 409 });
    }

    const newCandidate = await prisma.candidate.create({
      data: {
        name: body.name,
        role: body.role,
        match: body.match ?? body.cvScore ?? null,
        stage: 'new',
        cvScore: body.cvScore ?? null,
        testScore: body.testScore ?? null,
        salesScore: body.salesScore ?? null,
        salesFeedback: body.salesFeedback ?? null,
        videoLink: body.videoLink ?? null,
        vacancyId: vacancy.id,
        candidateUserId: session.id,
        openAnswers: { create: body.openAnswers || [] },
      },
      include: { openAnswers: true },
    });

    return NextResponse.json(newCandidate, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Candidates POST error:', error);
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
  }
}

// Employer (owner of the vacancy) or superadmin moves a candidate's stage.
export async function PATCH(request: Request) {
  try {
    const session = await requireUser(request);
    const body = await request.json();
    const { id, stage } = body;
    if (!id) return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { vacancy: { select: { employerId: true } } },
    });
    if (!candidate) return NextResponse.json({ error: 'Nomzod topilmadi' }, { status: 404 });

    if (candidate.vacancy.employerId !== session.id && session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
    }

    const validStages = ['new', 'review', 'interview', 'offer', 'hired', 'rejected'];
    if (!validStages.includes(stage)) {
      return NextResponse.json({ error: 'Noto\'g\'ri bosqich' }, { status: 400 });
    }

    const updated = await prisma.candidate.update({ where: { id }, data: { stage } });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Candidates PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
  }
}
