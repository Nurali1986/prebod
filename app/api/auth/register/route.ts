import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signSession, sessionCookie } from '@/lib/auth';
import { isDisposableDomain, domainCanReceiveMail } from '@/lib/email-validate';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password, role, company } = body;

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ error: 'Barcha majburiy maydonlarni to\'ldiring' }, { status: 400 });
    }

    // Only these two roles may self-register; superadmin is never assignable here.
    if (role !== 'candidate' && role !== 'employer') {
      return NextResponse.json({ error: 'Noto\'g\'ri rol tanlandi' }, { status: 400 });
    }

    const normEmail = String(email).toLowerCase().trim();
    if (!EMAIL_RE.test(normEmail)) {
      return NextResponse.json({ error: 'Email formati noto\'g\'ri' }, { status: 400 });
    }

    const domain = normEmail.split('@')[1] || '';
    if (isDisposableDomain(domain)) {
      return NextResponse.json({ error: 'Vaqtinchalik (temp-mail) pochtalardan foydalanib bo\'lmaydi' }, { status: 400 });
    }
    if (!(await domainCanReceiveMail(domain))) {
      return NextResponse.json({ error: 'Bunday email domeni mavjud emas — emailingizni tekshiring' }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak' }, { status: 400 });
    }
    if (role === 'employer' && !company?.trim()) {
      return NextResponse.json({ error: 'Kompaniya nomini kiriting' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        email: normEmail,
        phone: phone ? String(phone).trim() : null,
        password: hashedPassword,
        role,
        company: role === 'employer' ? String(company).trim() : null,
      },
    });

    const token = await signSession({ id: newUser.id, role: newUser.role, email: newUser.email });

    const res = NextResponse.json({
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      company: newUser.company,
      profileData: newUser.profileData,
    }, { status: 201 });
    res.headers.set('Set-Cookie', sessionCookie(token));
    return res;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
