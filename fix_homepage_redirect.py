import sys

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_effect = '''  useEffect(() => {
    const user = localStorage.getItem('ishla_user');
    if (user) {
      setLoggedInUser(JSON.parse(user));
    }
    if (window.location.search.includes('login=1')) {
      openLogin();
    } else if (window.location.search.includes('register=1')) {
      setRoleModalOpen(true);
    }
  }, []);'''

new_effect = '''  useEffect(() => {
    const user = localStorage.getItem('ishla_user');
    if (user) {
      const parsed = JSON.parse(user);
      setLoggedInUser(parsed);
      // Auto-redirect if they land on homepage while logged in
      if (!window.location.search.includes('noredirect')) {
        router.push(parsed.role === 'employer' ? '/hr' : '/vacansiy');
        return;
      }
    }
    if (window.location.search.includes('login=1')) {
      openLogin();
    } else if (window.location.search.includes('register=1')) {
      setRoleModalOpen(true);
    }
  }, [router]);'''

code = code.replace(old_effect, new_effect)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Added auto-redirect!")
