const fs = require('fs');
let code = fs.readFileSync('app/vacansiy/page.tsx', 'utf8');

const oldSet = 'setVacancies(formatted);';
const newSet = 'setVacancies(formatted);\n            const params = new URLSearchParams(window.location.search);\n            const vid = params.get("id");\n            if (vid) {\n               const targetV = formatted.find(x => x.publicId === vid);\n               if (targetV) {\n                 setCurrentJobId(targetV.id);\n                 setView("job-detail");\n               }\n            }';

code = code.replace(oldSet, newSet);
fs.writeFileSync('app/vacansiy/page.tsx', code);
