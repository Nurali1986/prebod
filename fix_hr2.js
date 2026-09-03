const fs = require('fs');
let code = fs.readFileSync('app/hr/page.tsx', 'utf8');

code = code.replace(
  "setAuthModalOpen(true);\n      setIsAuthChecking(false);",
  "window.location.href = '/?login=1';"
);

let returnPos = code.indexOf('return (');
if (returnPos !== -1) {
  let injection = "if (isAuthChecking) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Yuklanmoqda...</div>;\n\n  ";
  code = code.substring(0, returnPos) + injection + code.substring(returnPos);
  fs.writeFileSync('app/hr/page.tsx', code);
  console.log('Fixed HR panel redirect and loading state');
}
