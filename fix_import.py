import sys

with open('app/api/analyze-cv/route.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("import pdfParse from 'pdf-parse';", "const pdfParse = require('pdf-parse');")

with open('app/api/analyze-cv/route.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed pdf-parse import")
