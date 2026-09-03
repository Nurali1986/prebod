const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generatePublicId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let id = '';
  for(let i=0; i<5; i++) id += letters.charAt(Math.floor(Math.random() * letters.length));
  for(let i=0; i<5; i++) id += numbers.charAt(Math.floor(Math.random() * numbers.length));
  return id;
}

async function backfill() {
  const vacs = await prisma.vacancy.findMany({ where: { publicId: null } });
  for (const v of vacs) {
    await prisma.vacancy.update({
      where: { id: v.id },
      data: { publicId: generatePublicId() }
    });
  }
  console.log('Backfilled ' + vacs.length + ' vacancies.');
}
backfill();
