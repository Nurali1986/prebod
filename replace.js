const fs = require('fs');
let c = fs.readFileSync('app/vacansiy/page.tsx', 'utf-8');
c = c.replace(/initialVacancies\.find/g, 'vacancies.find');
fs.writeFileSync('app/vacansiy/page.tsx', c);
console.log('done');
