const fs = require('fs');
let code = fs.readFileSync('app/boshqaruv/page.tsx', 'utf8');
code = code.replace("          }\n        });\n\n  React.useEffect(() => {", "          }\n        });\n    }, []);\n\n  React.useEffect(() => {");
fs.writeFileSync('app/boshqaruv/page.tsx', code);
console.log('Fixed useEffect syntax error');
