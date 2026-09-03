const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');
code = code.replace('React.useEffect(() => {', 'useEffect(() => {');
fs.writeFileSync('app/page.tsx', code);
console.log('Fixed React is not defined in page.tsx');
