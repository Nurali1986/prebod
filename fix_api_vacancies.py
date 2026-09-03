import sys

with open('app/api/vacancies/route.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Add generate helper
helper = '''
function generatePublicId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let id = '';
  for(let i=0; i<5; i++) id += letters.charAt(Math.floor(Math.random() * letters.length));
  for(let i=0; i<5; i++) id += numbers.charAt(Math.floor(Math.random() * numbers.length));
  return id;
}
'''
code = code.replace("const prisma = new PrismaClient();", "const prisma = new PrismaClient();\n" + helper)

# Update POST
code = code.replace(
    "title: body.title,",
    "publicId: generatePublicId(),\n        title: body.title,"
)

with open('app/api/vacancies/route.ts', 'w', encoding='utf-8') as f:
    f.write(code)
