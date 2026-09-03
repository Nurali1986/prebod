const fs = require('fs');
let code = fs.readFileSync('app/boshqaruv/page.tsx', 'utf8');

// Replace static arrays with empty arrays
code = code.replace(/const initialHrUsers = \[[\s\S]*?\];/, "const initialHrUsers: any[] = [];");
code = code.replace(/const initialCandidateUsers = \[[\s\S]*?\];/, "const initialCandidateUsers: any[] = [];");

let useEffectInjection = `
    React.useEffect(() => {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            const hr = data.filter((u: any) => u.role === 'employer').map((u: any) => ({
              name: u.firstName + ' ' + u.lastName,
              company: u.company || 'Kompaniya ko\\'rsatilmagan',
              email: u.email,
              status: 'active'
            }));
            const cand = data.filter((u: any) => u.role === 'candidate').map((u: any) => ({
              name: u.firstName + ' ' + u.lastName,
              email: u.email,
              applications: 0,
              status: 'active'
            }));
            setHrUsers(hr);
            setCandidateUsers(cand);
          }
        });
`;

let target = "React.useEffect(() => {";
let firstUseEffect = code.indexOf(target);
if (firstUseEffect !== -1) {
  code = code.substring(0, firstUseEffect) + useEffectInjection + '\n  ' + code.substring(firstUseEffect);
  fs.writeFileSync('app/boshqaruv/page.tsx', code);
  console.log('Added fetch for users in boshqaruv page');
} else {
  console.log('Could not find React.useEffect');
}
