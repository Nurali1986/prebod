const fs = require('fs');

let code = fs.readFileSync('app/api/auth/login/route.ts', 'utf8');
code = code.replace(
  'company: user.company',
  'company: user.company,\n      profileData: user.profileData'
);
fs.writeFileSync('app/api/auth/login/route.ts', code);

let code2 = fs.readFileSync('app/api/auth/register/route.ts', 'utf8');
code2 = code2.replace(
  'company: newUser.company',
  'company: newUser.company,\n      profileData: newUser.profileData'
);
fs.writeFileSync('app/api/auth/register/route.ts', code2);

console.log('Fixed login and register APIs to include profileData');
