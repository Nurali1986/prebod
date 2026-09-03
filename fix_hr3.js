const fs = require('fs');
let code = fs.readFileSync('app/hr/page.tsx', 'utf8');

let badPartStart = code.indexOf("'use client';", 10);
if (badPartStart !== -1) {
  let goodPartStart = code.indexOf('const initialVacancies: any[] = [];');
  if (goodPartStart !== -1) {
    code = code.substring(0, badPartStart) + "  { id: 'raqobatchi', name: 'Sanjar (Sodiq Mijoz)', description: 'Boshqa firma bilan ishlaydi' },\n  { id: 'yangi', name: 'Sevara (Yangi Mijoz)', description: 'Sohani umuman bilmaydi' },\n];\n\n" + code.substring(goodPartStart);
    fs.writeFileSync('app/hr/page.tsx', code);
    console.log('Fixed array corruption');
  }
}
