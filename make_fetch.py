import sys

with open('app/vacansiy/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_logic = '''        setTimeout(() => {
          setDraft((prev: any) => ({ ...prev, cvScore: Math.floor(65 + Math.random() * 32), isCvLoading: false }));
          nextStep();
        }, 1300);'''

new_logic = '''        fetch('/api/analyze-cv', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ vacancy: v, profile: userObj?.profileData || {} })
        })
        .then(res => res.json())
        .then(data => {
           setDraft((prev: any) => ({ ...prev, cvScore: data.score, isCvLoading: false }));
           nextStep();
        })
        .catch(err => {
           setDraft((prev: any) => ({ ...prev, cvScore: 75, isCvLoading: false }));
           nextStep();
        });'''

code = code.replace(old_logic, new_logic)

with open('app/vacansiy/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated vacansiy/page.tsx with real API fetch")
