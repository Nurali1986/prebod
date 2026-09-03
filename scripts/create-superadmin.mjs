// Create or promote a superadmin account.
// Usage: node scripts/create-superadmin.mjs <email> [password]
// If password is omitted, a random one is generated and printed.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || '').toLowerCase().trim();
  if (!email) {
    console.error('Usage: node scripts/create-superadmin.mjs <email> [password]');
    process.exit(1);
  }
  const password = process.argv[3] || crypto.randomBytes(9).toString('base64url');
  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: 'superadmin', blocked: false } });
    console.log(`Existing user ${email} promoted to superadmin (password unchanged).`);
  } else {
    await prisma.user.create({
      data: { firstName: 'Super', lastName: 'Admin', email, password: hashed, role: 'superadmin' },
    });
    console.log('Superadmin created:');
    console.log('  email:   ', email);
    console.log('  password:', password);
    console.log('Log in via the home page, then open /boshqaruv. Change this password afterwards.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
