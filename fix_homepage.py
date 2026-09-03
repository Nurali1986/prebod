import sys

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add loggedInUser state
code = code.replace(
    "const [hiwTab, setHiwTab] = useState<'candidate' | 'employer'>('candidate');",
    "const [hiwTab, setHiwTab] = useState<'candidate' | 'employer'>('candidate');\n    const [loggedInUser, setLoggedInUser] = useState<any>(null);"
)

# Update useEffect
old_effect = '''  useEffect(() => {
    if (window.location.search.includes('login=1')) {
      openLogin();
    } else if (window.location.search.includes('register=1')) {
      setRoleModalOpen(true);
    }
  }, []);'''

new_effect = '''  useEffect(() => {
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

code = code.replace(old_effect, new_effect)

# Update header actions
old_head_actions = '''<div className="head-actions">
            <button className="btn btn-ghost" onClick={() => openLogin()}>Kirish</button>
            <button className="btn btn-primary" onClick={() => setRoleModalOpen(true)}>Ro&apos;yxatdan o&apos;tish</button>
          </div>'''

new_head_actions = '''<div className="head-actions">
            {loggedInUser ? (
              <button className="btn btn-primary" onClick={() => router.push(loggedInUser.role === 'employer' ? '/hr' : '/vacansiy')}>Kabinetga o&apos;tish</button>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => openLogin()}>Kirish</button>
                <button className="btn btn-primary" onClick={() => setRoleModalOpen(true)}>Ro&apos;yxatdan o&apos;tish</button>
              </>
            )}
          </div>'''

code = code.replace(old_head_actions, new_head_actions)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed homepage header for logged in users!")
