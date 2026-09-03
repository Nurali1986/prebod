import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, AuthError, authErrorResponse } from '@/lib/api-auth';

// Update ONLY the authenticated user's own profile data. The target user is
// taken from the session, never from the request body, so a user cannot
// overwrite someone else's profile.
export async function POST(request: Request) {
  try {
    const session = await requireUser(request);
    const { profileData } = await request.json();

    const user = await prisma.user.update({
      where: { id: session.id },
      data: { profileData },
      select: { profileData: true },
    });

    return NextResponse.json({ success: true, profileData: user.profileData });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
