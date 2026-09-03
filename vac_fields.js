const fs = require('fs');
let code = fs.readFileSync('app/vacansiy/page.tsx', 'utf8');

// Update saveProfile fields
code = code.replace(
  "const profileData = {\n      rTitle, rAbout, skills, expList, eduList, langList, courseList\n    };",
  "const profileData = {\n      rTitle, rAbout, skills, expList, eduList, langList, courseList, pIsm, pFam, rFio\n    };"
);

// Update load fields
let oldLoad = `if (parsed.profileData.rTitle) setRTitle(parsed.profileData.rTitle);`;
let newLoad = `if (parsed.profileData.rTitle) setRTitle(parsed.profileData.rTitle);
        if (parsed.profileData.pIsm) setPIsm(parsed.profileData.pIsm);
        if (parsed.profileData.pFam) setPFam(parsed.profileData.pFam);
        if (parsed.profileData.rFio) setRFio(parsed.profileData.rFio);`;
code = code.replace(oldLoad, newLoad);

fs.writeFileSync('app/vacansiy/page.tsx', code);
console.log('Fixed save fields');
