'use client';

import { useState, useEffect } from 'react';

interface Props {
  active?: 'home' | 'chat' | 'vacansiy' | 'profile';
  onLoginClick?: () => void;
  onProfileClick?: () => void;
}

export default function Navbar({ active, onLoginClick, onProfileClick }: Props) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('ishla_user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleProfile = () => {
    if (!user) {
      if (onLoginClick) onLoginClick();
      else window.location.href = '/?login=1';
      return;
    }
    if (onProfileClick) { onProfileClick(); return; }
    const r = user.role;
    if (r === 'superadmin') window.location.href = '/boshqaruv';
    else if (r === 'manager') window.location.href = '/jamoa';
    else if (r === 'employer') window.location.href = '/hr';
    else window.location.href = '/vacansiy?view=profile';
  };

  const go = (href: string) => { window.location.href = href; };

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : '';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .rn-bar{background:#14213D;color:#EFEDE4;padding:0 24px;display:flex;align-items:center;height:56px;position:sticky;top:0;z-index:40;}
        .rn-brand{display:flex;align-items:center;gap:10px;cursor:pointer;flex-shrink:0;}
        .rn-mark{width:30px;height:30px;border-radius:8px;background:#E8A33D;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-weight:600;color:#4A3110;font-size:16px;}
        .rn-name{font-family:'Fraunces',serif;font-size:18px;font-weight:600;color:#EFEDE4;}
        .rn-center{flex:1;display:flex;justify-content:center;gap:4px;}
        .rn-link{padding:8px 16px;border-radius:8px;font-size:13.5px;color:#C9C6BB;cursor:pointer;font-weight:500;border:none;background:none;font-family:'Inter',sans-serif;white-space:nowrap;}
        .rn-link:hover{background:rgba(239,237,228,0.08);color:#EFEDE4;}
        .rn-link.active{background:#E8A33D;color:#4A3110;font-weight:600;}
        .rn-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}
        .rn-lang{padding:6px 10px;border-radius:7px;font-size:12px;font-weight:600;color:#C9C6BB;cursor:pointer;border:1px solid rgba(201,198,187,0.2);background:none;font-family:'Inter',sans-serif;}
        .rn-lang:hover{background:rgba(239,237,228,0.08);color:#EFEDE4;}
        .rn-avatar{width:34px;height:34px;border-radius:50%;background:#3A4D78;color:#EFEDE4;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;cursor:pointer;border:2px solid transparent;flex-shrink:0;transition:border-color .15s;}
        .rn-avatar:hover{border-color:rgba(232,163,61,0.5);}
        .rn-avatar.active{border-color:#E8A33D;}
        .rn-bottom{display:none;}
        @media(max-width:720px){
          .rn-center{display:none;}
          .rn-avatar{display:none;}
          .rn-bar{padding:0 16px;height:52px;}
          .rn-bottom{display:flex;position:fixed;bottom:0;left:0;right:0;background:#14213D;border-top:1px solid rgba(239,237,228,0.1);z-index:40;padding:6px 0 max(6px,env(safe-area-inset-bottom));justify-content:space-around;}
          .rn-btab{display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 8px;border:none;background:none;color:#8B93A8;font-size:10px;font-weight:500;cursor:pointer;font-family:'Inter',sans-serif;min-width:56px;}
          .rn-btab svg{width:20px;height:20px;}
          .rn-btab.active{color:#E8A33D;}
          .rn-btab.active svg{stroke:#E8A33D;}
          body{padding-bottom:64px;}
        }
      `}} />
      <div className="rn-bar">
        <div className="rn-brand" onClick={() => go('/')}>
          <div className="rn-mark">R</div>
          <div className="rn-name">Repza</div>
        </div>
        <div className="rn-center">
          <button className={`rn-link ${active === 'home' ? 'active' : ''}`} onClick={() => go('/')}>Bosh sahifa</button>
          <button className={`rn-link ${active === 'chat' ? 'active' : ''}`} onClick={() => go('/chat')}>AI simulyator</button>
          <button className={`rn-link ${active === 'vacansiy' ? 'active' : ''}`} onClick={() => go('/vacansiy')}>Vakansiya</button>
        </div>
        <div className="rn-right">
          <button className="rn-lang" title="Til">UZ</button>
          <button className={`rn-avatar ${active === 'profile' ? 'active' : ''}`} onClick={handleProfile} title="Profil">
            {user ? initials : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          </button>
        </div>
      </div>
      {/* Mobile bottom nav */}
      <div className="rn-bottom">
        <button className={`rn-btab ${active === 'home' ? 'active' : ''}`} onClick={() => go('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Bosh sahifa
        </button>
        <button className={`rn-btab ${active === 'chat' ? 'active' : ''}`} onClick={() => go('/chat')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Simulyator
        </button>
        <button className={`rn-btab ${active === 'vacansiy' ? 'active' : ''}`} onClick={() => go('/vacansiy')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          Vakansiya
        </button>
        <button className={`rn-btab ${active === 'profile' ? 'active' : ''}`} onClick={handleProfile}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Profil
        </button>
      </div>
    </>
  );
}
