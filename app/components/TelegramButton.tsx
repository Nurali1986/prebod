'use client';

import { useEffect, useRef } from 'react';

// Renders the official Telegram Login Widget. On success Telegram redirects the
// browser to our data-auth-url with the signed user data.
export default function TelegramButton({ bot, role }: { bot: string; role: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !bot) return;
    el.innerHTML = '';
    const s = document.createElement('script');
    s.src = 'https://telegram.org/js/telegram-widget.js?22';
    s.async = true;
    s.setAttribute('data-telegram-login', bot);
    s.setAttribute('data-size', 'large');
    s.setAttribute('data-radius', '8');
    s.setAttribute('data-request-access', 'write');
    s.setAttribute('data-auth-url', `${window.location.origin}/api/auth/telegram/callback?role=${encodeURIComponent(role)}`);
    el.appendChild(s);
  }, [bot, role]);

  return <div ref={ref} style={{ display: 'flex', justifyContent: 'center' }} />;
}
