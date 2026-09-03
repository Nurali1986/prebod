const fs = require('fs');
let code = fs.readFileSync('app/boshqaruv/page.tsx', 'utf8');

code = code.replace(/const initialCompanies = \[[\s\S]*?\];/, "const initialCompanies: any[] = [];");

let computeInjection = `
            const groupedCos = hr.reduce((acc: any, curr: any) => {
              if (!acc[curr.company]) {
                acc[curr.company] = { id: Object.keys(acc).length + 1, name: curr.company, industry: 'Noma\\'lum', plan: 'Bepul', status: 'active', vacancies: 0, hrUsers: 1, joined: 'Bugun' };
              } else {
                acc[curr.company].hrUsers += 1;
              }
              return acc;
            }, {});
            setCompanies(Object.values(groupedCos));
`;

code = code.replace("setCandidateUsers(cand);", "setCandidateUsers(cand);" + computeInjection);

fs.writeFileSync('app/boshqaruv/page.tsx', code);
console.log('Fixed companies');
