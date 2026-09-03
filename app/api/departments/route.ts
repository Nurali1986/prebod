import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, AuthError, authErrorResponse } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    await requireRole(request, 'employer', 'superadmin');
    const depts = await prisma.department.findMany({
      include: { tests: true, openQs: true },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(depts);
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

// Superadmin: create a new department.
export async function POST(request: Request) {
  try {
    await requireRole(request, 'superadmin');
    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Bo\'lim nomini kiriting' }, { status: 400 });

    const existing = await prisma.department.findUnique({ where: { name: name.trim() } });
    if (existing) return NextResponse.json({ error: 'Bunday bo\'lim allaqachon mavjud' }, { status: 409 });

    const dept = await prisma.department.create({
      data: { name: name.trim() },
      include: { tests: true, openQs: true },
    });
    return NextResponse.json(dept, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}

// Superadmin: replace a department's standard test/open-question bank.
export async function PATCH(request: Request) {
  try {
    await requireRole(request, 'superadmin');
    const { id, tests, openQs } = await request.json();
    if (!id) return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });

    await prisma.$transaction([
      prisma.testQuestion.deleteMany({ where: { departmentId: id } }),
      prisma.openQuestion.deleteMany({ where: { departmentId: id } }),
      ...(Array.isArray(tests)
        ? [prisma.testQuestion.createMany({
            data: tests.map((t: any) => ({
              text: t.text, options: t.options, correct: t.correct, departmentId: id,
            })),
          })]
        : []),
      ...(Array.isArray(openQs)
        ? [prisma.openQuestion.createMany({
            data: openQs.map((q: any) => ({ text: q.text, departmentId: id })),
          })]
        : []),
    ]);

    const dept = await prisma.department.findUnique({
      where: { id },
      include: { tests: true, openQs: true },
    });
    return NextResponse.json(dept);
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Departments PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

// Superadmin: delete a department (fails if vacancies still reference it).
export async function DELETE(request: Request) {
  try {
    await requireRole(request, 'superadmin');
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });

    const vacCount = await prisma.vacancy.count({ where: { departmentId: id } });
    if (vacCount > 0) {
      return NextResponse.json({ error: 'Bu bo\'limda vakansiyalar bor, avval ularni o\'chiring' }, { status: 409 });
    }

    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Departments DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
