import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, requireUser, AuthError, authErrorResponse } from '@/lib/api-auth';

function generatePublicId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let id = '';
  for (let i = 0; i < 5; i++) id += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 5; i++) id += numbers.charAt(Math.floor(Math.random() * numbers.length));
  return id;
}

// Strip the `correct` answer index from tests before sending to candidates,
// so answers can't be read from the browser.
function stripTestAnswers(v: any) {
  return {
    ...v,
    vacancyTests: (v.vacancyTests || []).map((t: any) => ({ id: t.id, text: t.text, options: t.options })),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dept = searchParams.get('dept');
  const mine = searchParams.get('mine');
  const all = searchParams.get('all');

  try {
    // Employer view: only my own vacancies, including candidate data.
    if (mine) {
      const session = await requireRole(request, 'employer', 'superadmin');
      const vacancies = await prisma.vacancy.findMany({
        where: { employerId: session.id },
        include: {
          department: true,
          vacancyTests: true,
          vacancyOpenQs: true,
          candidates: { include: { openAnswers: true } },
        },
        orderBy: { id: 'desc' },
      });
      return NextResponse.json(vacancies);
    }

    // Superadmin moderation view: all vacancies, no candidate PII.
    if (all) {
      await requireRole(request, 'superadmin');
      const vacancies = await prisma.vacancy.findMany({
        include: {
          department: true,
          vacancyTests: true,
          vacancyOpenQs: true,
          employer: { select: { company: true, firstName: true, lastName: true } },
        },
        orderBy: { id: 'desc' },
      });
      return NextResponse.json(vacancies.map(stripTestAnswers));
    }

    // Public job board: only published (non-draft) vacancies, no candidate PII,
    // no test answers.
    const whereClause: any = { status: { not: 'draft' } };
    if (dept) whereClause.department = { name: dept };

    const vacancies = await prisma.vacancy.findMany({
      where: whereClause,
      include: {
        department: true,
        vacancyTests: true,
        vacancyOpenQs: true,
      },
      orderBy: { id: 'desc' },
    });
    return NextResponse.json(vacancies.map(stripTestAnswers));
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Vacancies GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch vacancies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(request, 'employer', 'superadmin');
    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Lavozim nomini kiriting' }, { status: 400 });
    }

    const newVacancy = await prisma.vacancy.create({
      data: {
        publicId: generatePublicId(),
        title: body.title,
        type: body.type,
        loc: body.loc,
        salary: body.salary,
        desc: body.desc,
        status: body.status === 'draft' ? 'draft' : 'active',
        posted: body.posted || '—',
        departmentId: body.departmentId,
        employerId: session.id,
        cvMinScore: body.cvMinScore ?? 0,
        cvCheckEnabled: body.cvCheckEnabled ?? true,
        testEnabled: body.testEnabled ?? false,
        openQEnabled: body.openQEnabled ?? false,
        salesEnabled: body.salesEnabled ?? false,
        salesProduct: body.salesProduct,
        salesPersonas: body.salesPersonas ?? [],
        videoEnabled: body.videoEnabled ?? false,
        videoPrompt: body.videoPrompt,
        vacancyTests: { create: body.tests || [] },
        vacancyOpenQs: { create: body.openQs || [] },
      },
      include: { department: true, vacancyTests: true, vacancyOpenQs: true },
    });

    return NextResponse.json(newVacancy, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Vacancies POST error:', error);
    return NextResponse.json({ error: 'Failed to create vacancy' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireUser(request);
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Vacancy ID is required' }, { status: 400 });

    const vacancy = await prisma.vacancy.findUnique({ where: { id } });
    if (!vacancy) return NextResponse.json({ error: 'Vakansiya topilmadi' }, { status: 404 });

    const isOwner = vacancy.employerId === session.id;
    const isSuperadmin = session.role === 'superadmin';
    if (!isOwner && !isSuperadmin) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
    }

    // Only a fixed set of scalar fields may be updated (never relations/ownership).
    const allowed = [
      'title', 'type', 'loc', 'salary', 'desc', 'status', 'posted',
      'cvMinScore', 'cvCheckEnabled', 'testEnabled', 'openQEnabled',
      'salesEnabled', 'salesProduct', 'salesPersonas', 'videoEnabled', 'videoPrompt',
    ];
    const updateData: any = {};
    for (const k of allowed) if (k in data) updateData[k] = data[k];

    const updated = await prisma.vacancy.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Vacancies PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update vacancy' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Vacancy ID is required' }, { status: 400 });

    const vacancy = await prisma.vacancy.findUnique({ where: { id } });
    if (!vacancy) return NextResponse.json({ error: 'Vakansiya topilmadi' }, { status: 404 });

    if (vacancy.employerId !== session.id && session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
    }

    await prisma.vacancy.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Vacancies DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete vacancy' }, { status: 500 });
  }
}
