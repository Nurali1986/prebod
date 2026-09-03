import sys

with open('app/vacansiy/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_random = '''        setTimeout(() => {
          setDraft((prev: any) => ({ ...prev, cvScore: Math.floor(65 + Math.random() * 32), isCvLoading: false }));
          nextStep();
        }, 1300);'''

new_random = '''        setTimeout(() => {
          setDraft((prev: any) => {
            const profileScore = getMatchScore(prev.vacancyId) || Math.floor(65 + Math.random() * 32);
            const score = prev.cvSource === 'profile' ? profileScore : Math.floor(65 + Math.random() * 32);
            return { ...prev, cvScore: score, isCvLoading: false };
          });
          nextStep();
        }, 1300);'''

code = code.replace(old_random, new_random)

with open('app/vacansiy/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
