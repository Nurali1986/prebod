const fs = require('fs');
let code = fs.readFileSync('app/vacansiy/page.tsx', 'utf8');

code = code.replace(
  "rTitle, rAbout, skills, expList, eduList, langList, courseList, pIsm, pFam, rFio",
  "rTitle, rAbout, skills, expList, eduList, langList, courseList, pIsm, pFam, rFio, profilePhoto"
);

code = code.replace(
  "if (parsed.profileData.rFio) setRFio(parsed.profileData.rFio);",
  "if (parsed.profileData.rFio) setRFio(parsed.profileData.rFio);\n        if (parsed.profileData.profilePhoto) setProfilePhoto(parsed.profileData.profilePhoto);"
);

fs.writeFileSync('app/vacansiy/page.tsx', code);
console.log('Fixed profilePhoto save');
