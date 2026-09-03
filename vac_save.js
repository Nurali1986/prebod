const fs = require('fs');
let code = fs.readFileSync('app/vacansiy/page.tsx', 'utf8');

// 1. Add saveProfile function
let marker1 = "const startApply = (id: number) => {";
let saveFunc = `
  const saveProfile = async () => {
    if (!userObj || !userObj.email) return;
    const profileData = {
      rTitle, rAbout, skills, expList, eduList, langList, courseList
    };
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userObj.email, profileData })
      });
      if (res.ok) {
        showToast('Profil muvaffaqiyatli saqlandi');
        const updatedUser = { ...userObj, profileData };
        setUserObj(updatedUser);
        localStorage.setItem('ishla_user', JSON.stringify(updatedUser));
      } else {
        showToast('Saqlashda xatolik');
      }
    } catch(e) { showToast('Tarmoq xatosi'); }
  };
`;

let pos1 = code.indexOf(marker1);
if (pos1 !== -1) {
  code = code.substring(0, pos1) + saveFunc + '\n  ' + code.substring(pos1);
}

// 2. Change onClick for save button
code = code.replace(
  "onClick={() => showToast('Profil sozlamalari saqlandi')}>Saqlash</button>",
  "onClick={saveProfile}>Saqlash</button>"
);

// 3. Update useEffect to load profileData
let useEffectMatch = code.indexOf("setPFam(parsed.lastName || '');\n    }\n  }, []);");
if (useEffectMatch !== -1) {
  let injection = `
      if (parsed.profileData) {
        if (parsed.profileData.rTitle) setRTitle(parsed.profileData.rTitle);
        if (parsed.profileData.rAbout) setRAbout(parsed.profileData.rAbout);
        if (parsed.profileData.skills) setSkills(parsed.profileData.skills);
        if (parsed.profileData.expList) setExpList(parsed.profileData.expList);
        if (parsed.profileData.eduList) setEduList(parsed.profileData.eduList);
        if (parsed.profileData.langList) setLangList(parsed.profileData.langList);
        if (parsed.profileData.courseList) setCourseList(parsed.profileData.courseList);
      }
`;
  let insertPos = code.indexOf("    }", useEffectMatch);
  code = code.substring(0, insertPos) + injection + code.substring(insertPos);
}

fs.writeFileSync('app/vacansiy/page.tsx', code);
console.log('Added profile saving and loading');
