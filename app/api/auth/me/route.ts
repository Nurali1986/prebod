import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/api-auth';

// Returns the currently authenticated user (based on the httpOnly cookie),
// so the client can trust role/identity from the server rather than localStorage.
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ user: null }, { status: 200 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      role: true, company: true, blocked: true, profileData: true,
    },
  });
  if (!user || user.blocked) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user });
}
