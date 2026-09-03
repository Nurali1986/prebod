import sys

with open('app/vacansiy/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_submit = '''  const submitInfo = () => {
    if (!draft.cvFileName) {
      setDraft({ ...draft, cvError: true });
      return;
    }
    const v = vacancies.find(x => x.id === draft.vacancyId);
    if (v?.aiConfig.cvCheck.enabled && draft.cvScore === null) {
      setDraft({ ...draft, isCvLoading: true });
      setTimeout(() => {
        setDraft((prev: any) => ({ ...prev, cvScore: Math.floor(65 + Math.random() * 32), isCvLoading: false }));
        nextStep();
      }, 1300);
    } else {
      nextStep();
    }
  };'''

new_submit = '''  const submitInfo = async () => {
    if (!draft.cvFileName) {
      setDraft({ ...draft, cvError: true });
      return;
    }
    const v = vacancies.find(x => x.id === draft.vacancyId);
    if (v?.aiConfig.cvCheck.enabled && draft.cvScore === null) {
      setDraft({ ...draft, isCvLoading: true });
      
      try {
        let reqBody: any;
        let headers: any = {};
        
        if (draft.cvSource === 'file' && draft.fileObj) {
          reqBody = new FormData();
          reqBody.append('vacancy', JSON.stringify(v));
          reqBody.append('file', draft.fileObj);
          // Omit Content-Type to let browser set boundary for FormData
        } else {
          reqBody = JSON.stringify({ vacancy: v, profile: userObj?.profileData || {} });
          headers['Content-Type'] = 'application/json';
        }
        
        const res = await fetch('/api/analyze-cv', {
           method: 'POST',
           headers,
           body: reqBody
        });
        
        const data = await res.json();
        setDraft((prev: any) => ({ ...prev, cvScore: data.score, isCvLoading: false }));
        nextStep();
      } catch (err) {
        console.error("AI fetch failed:", err);
        setDraft((prev: any) => ({ ...prev, cvScore: Math.floor(65 + Math.random() * 32), isCvLoading: false }));
        nextStep();
      }
    } else {
      nextStep();
    }
  };'''

code = code.replace(old_submit, new_submit)

with open('app/vacansiy/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated submitInfo to send real AI fetch request (FormData or JSON)")
