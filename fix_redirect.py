import sys

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old = '''// Auto-redirect if they land on homepage while logged in
      if (!window.location.search.includes('noredirect')) {
        router.push(parsed.role === 'employer' ? '/hr' : '/vacansiy');
        return;
      }'''

code = code.replace(old, '')

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
