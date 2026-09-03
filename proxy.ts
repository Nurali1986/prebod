import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

// Page-level route protection. API routes enforce their own authorization
// (they need per-record ownership checks), so they are not matched here.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  const loginUrl = new URL('/?login=1', request.url);
  const homeUrl = new URL('/', request.url);

  if (!session) {
    return NextResponse.redirect(loginUrl);
  }

  const role = session.role;
  if (pathname.startsWith('/boshqaruv') && role !== 'superadmin') {
    return NextResponse.redirect(homeUrl);
  }
  if (pathname.startsWith('/jamoa') && role !== 'manager' && role !== 'superadmin') {
    return NextResponse.redirect(homeUrl);
  }
  if (pathname.startsWith('/hr') && role !== 'employer' && role !== 'manager' && role !== 'superadmin') {
    return NextResponse.redirect(homeUrl);
  }
  // /mashq and /chat: any authenticated user is allowed.

  return NextResponse.next();
}

export const config = {
  matcher: ['/mashq/:path*', '/jamoa/:path*', '/hr/:path*', '/boshqaruv/:path*', '/chat/:path*'],
};
