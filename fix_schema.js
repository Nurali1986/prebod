const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

code = code.replace(
  'title         String',
  'publicId      String?  @unique\n  title         String'
);

fs.writeFileSync('prisma/schema.prisma', code);
console.log('Added publicId to Prisma schema');
