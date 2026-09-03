import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signSession, sessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email va parolni kiriting' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    // Same message for "no user" and "bad password" to avoid user enumeration.
    if (!user) {
      return NextResponse.json({ error: 'Email yoki parol noto\'g\'ri' }, { status: 401 });
    }

    // Social-login accounts have no password.
    if (!user.password) {
      return NextResponse.json({ error: 'Bu hisob Google yoki Telegram orqali yaratilgan — o\'sha tugma orqali kiring' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Email yoki parol noto\'g\'ri' }, { status: 401 });
    }

    if (user.blocked) {
      return NextResponse.json({ error: 'Hisobingiz bloklangan. Qo\'llab-quvvatlashga murojaat qiling.' }, { status: 403 });
    }

    const token = await signSession({ id: user.id, role: user.role, email: user.email });

    const res = NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      company: user.company,
      profileData: user.profileData,
    }, { status: 200 });
    res.headers.set('Set-Cookie', sessionCookie(token));
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
