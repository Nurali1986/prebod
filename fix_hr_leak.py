import sys

with open('app/vacansiy/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update useEffect
old_effect = '''      if (user) {
        setIsLoggedIn(true);
        const parsed = JSON.parse(user);
        setUserObj(parsed);
        setPIsm(parsed.firstName || '');
        setPFam(parsed.lastName || '');
  
        if (parsed.profileData) {
          if (parsed.profileData.rTitle) setRTitle(parsed.profileData.rTitle);
          if (parsed.profileData.pIsm) setPIsm(parsed.profileData.pIsm);
          if (parsed.profileData.pFam) setPFam(parsed.profileData.pFam);
          if (parsed.profileData.rFio) setRFio(parsed.profileData.rFio);
          if (parsed.profileData.profilePhoto) setProfilePhoto(parsed.profileData.profilePhoto);
          if (parsed.profileData.rAbout) setRAbout(parsed.profileData.rAbout);
          if (parsed.profileData.skills) setSkills(parsed.profileData.skills);
          if (parsed.profileData.expList) setExpList(parsed.profileData.expList);
          if (parsed.profileData.eduList) setEduList(parsed.profileData.eduList);
          if (parsed.profileData.langList) setLangList(parsed.profileData.langList);
          if (parsed.profileData.courseList) setCourseList(parsed.profileData.courseList);
        }
      }'''

new_effect = '''      if (user) {
        const parsed = JSON.parse(user);
        if (parsed.role === 'employer') {
            // HR users browse as guests
        } else {
            setIsLoggedIn(true);
            setUserObj(parsed);
            setPIsm(parsed.firstName || '');
            setPFam(parsed.lastName || '');
      
            if (parsed.profileData) {
              if (parsed.profileData.rTitle) setRTitle(parsed.profileData.rTitle);
              if (parsed.profileData.pIsm) setPIsm(parsed.profileData.pIsm);
              if (parsed.profileData.pFam) setPFam(parsed.profileData.pFam);
              if (parsed.profileData.rFio) setRFio(parsed.profileData.rFio);
              if (parsed.profileData.profilePhoto) setProfilePhoto(parsed.profileData.profilePhoto);
              if (parsed.profileData.rAbout) setRAbout(parsed.profileData.rAbout);
              if (parsed.profileData.skills) setSkills(parsed.profileData.skills);
              if (parsed.profileData.expList) setExpList(parsed.profileData.expList);
              if (parsed.profileData.eduList) setEduList(parsed.profileData.eduList);
              if (parsed.profileData.langList) setLangList(parsed.profileData.langList);
              if (parsed.profileData.courseList) setCourseList(parsed.profileData.courseList);
            }
        }
      }'''

code = code.replace(old_effect, new_effect)

# 2. Fix top-avatar onClick
old_avatar = '''<div className="top-avatar" onClick={() => {
                  setView('profile');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}>'''

new_avatar = '''<div className="top-avatar" onClick={() => {
                  if (!isLoggedIn) { setAuthModalOpen(true); return; }
                  setView('profile');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}>'''

code = code.replace(old_avatar, new_avatar)

# 3. Fix unmanaged email inputs
old_email1 = '<div className="field"><label>Elektron pochta</label><input type="email" placeholder="ism@pochta.uz" /></div>'
new_email1 = '<div className="field"><label>Elektron pochta</label><input type="email" placeholder="ism@pochta.uz" value={userObj?.email || ""} readOnly /></div>'

old_email2 = '<div className="field"><label>Email</label><input type="email" placeholder="ism@pochta.uz" onChange={e => setContactOk(e.target.value.length > 5)} /></div>'
new_email2 = '<div className="field"><label>Email</label><input type="email" placeholder="ism@pochta.uz" value={userObj?.email || ""} readOnly /></div>'

code = code.replace(old_email1, new_email1)
code = code.replace(old_email2, new_email2)

with open('app/vacansiy/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Applied fixes via Python!")
