'use client';

import { useState, useEffect } from 'react';

interface Props {
  active?: 'home' | 'chat' | 'vacansiy';
  onLoginClick?: () => void;
  onAvatarClick?: () => void;
}

export default function Navbar({ active, onLoginClick, onAvatarClick }: Props) {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('ishla_user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleAvatar = () => {
    if (!user) {
      if (onLoginClick) onLoginClick();
      else window.location.href = '/?login=1';
      return;
    }
    if (onAvatarClick) { onAvatarClick(); return; }
    const r = user.role;
    if (r === 'superadmin') window.location.href = '/boshqaruv';
    else if (r === 'manager') window.location.href = '/jamoa';
    else if (r === 'employer') window.location.href = '/hr';
    else window.location.href = '/vacansiy';
  };

  const go = (href: string) => { setMenuOpen(false); window.location.href = href; };

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : '';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .rn-bar{background:#14213D;color:#EFEDE4;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:60px;position:sticky;top:0;z-index:40;}
        .rn-brand{display:flex;align-items:center;gap:10px;cursor:pointer;}
        .rn-mark{width:30px;height:30px;border-radius:8px;background:#E8A33D;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-weight:600;color:#4A3110;font-size:16px;}
        .rn-name{font-family:'Fraunces',serif;font-size:19px;font-weight:600;color:#EFEDE4;}
        .rn-nav{display:flex;gap:4px;align-items:center;}
        .rn-link{padding:9px 14px;border-radius:8px;font-size:13.5px;color:#C9C6BB;cursor:pointer;font-weight:500;border:none;background:none;font-family:'Inter',sans-serif;}
        .rn-link:hover{background:rgba(239,237,228,0.08);color:#EFEDE4;}
        .rn-link.active{background:#E8A33D;color:#4A3110;font-weight:600;}
        .rn-avatar{width:34px;height:34px;border-radius:50%;background:#3A4D78;color:#EFEDE4;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;margin-left:10px;cursor:pointer;border:none;flex-shrink:0;}
        .rn-avatar:hover{opacity:0.85;}
        .rn-hamburger{display:none;background:none;border:1px solid rgba(239,237,228,0.2);border-radius:8px;padding:8px;cursor:pointer;color:#EFEDE4;}
        .rn-drawer-bg{position:fixed;inset:0;background:rgba(20,33,61,.5);backdrop-filter:blur(4px);z-index:90;}
        .rn-drawer{position:fixed;top:0;right:0;bottom:0;width:min(300px,82vw);background:#fff;padding:20px;display:flex;flex-direction:column;gap:4px;box-shadow:-8px 0 30px rgba(0,0,0,.15);z-index:91;}
        .rn-dl{padding:12px 10px;border-radius:8px;font-size:15px;font-weight:600;color:#2C3E63;display:block;border:none;background:none;text-align:left;cursor:pointer;width:100%;font-family:'Inter',sans-serif;}
        .rn-dl:hover{background:#EDF1EE;color:#14213D;}
        .rn-dclose{align-self:flex-end;background:none;border:none;cursor:pointer;color:#6B7280;padding:6px;}
        @media(max-width:720px){
          .rn-nav{display:none;}
          .rn-hamburger{display:inline-flex;}
          .rn-bar{padding:0 16px;}
        }
      `}} />
      <div className="rn-bar">
        <div className="rn-brand" onClick={() => go('/')}>
          <div className="rn-mark">R</div>
          <div className="rn-name">Repza</div>
        </div>
        <div className="rn-nav">
          <button className={`rn-link ${active === 'home' ? 'active' : ''}`} onClick={() => go('/')}>Bosh sahifa</button>
          <button className={`rn-link ${active === 'chat' ? 'active' : ''}`} onClick={() => go('/chat')}>AI simulyator</button>
          <button className={`rn-link ${active === 'vacansiy' ? 'active' : ''}`} onClick={() => go('/vacansiy')}>Vakansiya</button>
          <button className="rn-avatar" onClick={handleAvatar} title="Profil">
            {user ? initials : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          </button>
        </div>
        <button className="rn-hamburger" aria-label="Menyu" onClick={() => setMenuOpen(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>
      {menuOpen && (
        <div className="rn-drawer-bg" onClick={() => setMenuOpen(false)}>
          <div className="rn-drawer" onClick={e => e.stopPropagation()}>
            <button className="rn-dclose" onClick={() => setMenuOpen(false)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <button className="rn-dl" onClick={() => go('/')}>Bosh sahifa</button>
            <button className="rn-dl" onClick={() => go('/chat')}>AI simulyator</button>
            <button className="rn-dl" onClick={() => go('/vacansiy')}>Vakansiya</button>
            <div style={{ marginTop: 'auto' }}>
              {user ? (
                <button className="rn-dl" onClick={() => { setMenuOpen(false); handleAvatar(); }}>Profil</button>
              ) : (
                <button className="rn-dl" onClick={() => { setMenuOpen(false); if (onLoginClick) onLoginClick(); else window.location.href = '/?login=1'; }}>Kirish</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
