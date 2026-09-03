'use client';

import { useEffect } from 'react';

// After a social login (Google/Telegram) the session cookie is already set.
// This page loads the user from the server, mirrors it into localStorage (for
// UI display), and routes to the right cabinet by role.
export default function AuthFinish() {
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        const user = data.user;
        if (!user) { window.location.href = '/?login=1'; return; }
        localStorage.setItem('ishla_user', JSON.stringify(user));
        const dest = user.role === 'superadmin' ? '/boshqaruv' : user.role === 'employer' ? '/hr' : '/vacansiy';
        window.location.href = dest;
      } catch {
        window.location.href = '/?login=1';
      }
    })();
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#2C3E63' }}>
      Kirilmoqda...
    </div>
  );
}
