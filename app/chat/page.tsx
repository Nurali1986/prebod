// app/chat/page.tsx — Phone-call style AI sales simulator (voice only).
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface HistoryTurn { role: 'user' | 'assistant'; content: string; }
interface QueueItem { id: string; text: string; audioUrl: string | null; ready: boolean; failed: boolean; }

type Character = {
  id: string; name: string; firstName: string; voice: string;
  description: string; avatar: string; greeting: string;
};

// Realistic portrait photos (randomuser.me) per persona, gender-matched to voice.
const CHARACTERS: Character[] = [
  { id: 'ishonmaydigan', name: 'Rustam', firstName: 'Rustam', voice: 'uz-UZ-SardorNeural', description: 'Ishonchsiz — hech kimga ishonmaydi', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', greeting: 'Alo, assalomu alaykum. Eshitaman.' },
  { id: 'band', name: 'Sardor', firstName: 'Sardor', voice: 'uz-UZ-SardorNeural', description: 'Band rahbar — vaqti yo\'q', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', greeting: 'Alo, assalomu alaykum. Kim bu?' },
  { id: 'buhgalter', name: 'Madina', firstName: 'Madina', voice: 'uz-UZ-MadinaNeural', description: 'Buxgalter — faqat raqamlar', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', greeting: 'Assalomu alaykum. Eshitaman sizni.' },
  { id: 'bazorchi', name: 'Aziza', firstName: 'Aziza', voice: 'uz-UZ-MadinaNeural', description: 'Narx talashuvchi — chegirma so\'raydi', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', greeting: 'Alo, assalomu alaykum. Qanaqa masala edi?' },
  { id: 'bilagon', name: 'Jasur', firstName: 'Jasur', voice: 'uz-UZ-SardorNeural', description: 'Ekspert — "hammasini bilaman"', avatar: 'https://randomuser.me/api/portraits/men/76.jpg', greeting: 'Assalomu alaykum. Xo\'sh, qanday masalada telefon qildingiz?' },
  { id: 'ikkilanuvchi', name: 'Nigora', firstName: 'Nigora', voice: 'uz-UZ-MadinaNeural', description: 'Ikkilanuvchi — qaror berolmaydi', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', greeting: 'Alo... Assalomu alaykum, eshityapman.' },
  { id: 'achchiq', name: 'Tohir', firstName: 'Tohir', voice: 'uz-UZ-SardorNeural', description: 'Asabiy — oldin yomon tajriba bo\'lgan', avatar: 'https://randomuser.me/api/portraits/men/52.jpg', greeting: 'Alo, assalomu alaykum. Siz kimsiz?' },
  { id: 'muloyim_sust', name: 'Zarina', firstName: 'Zarina', voice: 'uz-UZ-MadinaNeural', description: 'Muloyim — hammaga "ha" deydi', avatar: 'https://randomuser.me/api/portraits/women/33.jpg', greeting: 'Assalomu alaykum! Eshitaman, marhamat.' },
  { id: 'raqobatchi', name: 'Sanjar', firstName: 'Sanjar', voice: 'uz-UZ-SardorNeural', description: 'Sodiq mijoz — boshqa firma bilan ishlaydi', avatar: 'https://randomuser.me/api/portraits/men/12.jpg', greeting: 'Alo, assalomu alaykum. Nima deysiz?' },
  { id: 'yangi', name: 'Sevara', firstName: 'Sevara', voice: 'uz-UZ-MadinaNeural', description: 'Yangi mijoz — sohani bilmaydi', avatar: 'https://randomuser.me/api/portraits/women/90.jpg', greeting: 'Assalomu alaykum. Eshitaman, gapiravering.' },
];

const STAGE_META = [
  { key: 'tanishuv', label: 'Tanishuv', max: 12, re: /Tanishuv[^\d]{0,8}(\d+)\s*\/\s*12/i },
  { key: 'programma', label: 'Programma', max: 8, re: /Programm[^\d]{0,12}(\d+)\s*\/\s*8/i },
  { key: 'yaqinlashuv', label: 'Yaqinlashuv', max: 9, re: /Yaqinlash[^\d]{0,12}(\d+)\s*\/\s*9/i },
  { key: 'ehtiyoj', label: 'Ehtiyoj', max: 20, re: /Ehtiyoj[^\d]{0,16}(\d+)\s*\/\s*20/i },
  { key: 'taqdimot', label: 'Taqdimot', max: 20, re: /Taqdimot[^\d]{0,8}(\d+)\s*\/\s*20/i },
  { key: 'etiroz', label: "E'tirozlar", max: 9, re: /E.tirozlar[^\d]{0,16}(\d+)\s*\/\s*9/i },
  { key: 'yopish', label: 'Yopish', max: 16, re: /Yopish[^\d]{0,16}(\d+)\s*\/\s*16/i },
  { key: 'followup', label: 'Follow-up', max: 6, re: /Follow[^\d]{0,12}(\d+)\s*\/\s*6/i },
];

function parseStagesFromText(text: string): Record<string, number> | null {
  const result: Record<string, number> = {};
  let found = 0;
  for (const s of STAGE_META) {
    const m = text.match(s.re);
    if (m) { result[s.key] = Math.min(s.max, parseInt(m[1], 10)); found++; }
  }
  return found >= 4 ? result : null;
}

const generateId = () => 'id-' + Math.random().toString(36).substring(2, 15);

function extractCompleteSentences(buffer: string): { sentences: string[]; rest: string } {
  const matches = buffer.match(/[^.!?]*[.!?]+[\s"')\]]*/g);
  if (!matches) return { sentences: [], rest: buffer };
  const consumed = matches.join('');
  return { sentences: matches.map((s) => s.trim()).filter(Boolean), rest: buffer.slice(consumed.length) };
}

export default function ChatPage() {
  const [callState, setCallState] = useState<'select' | 'active' | 'ended'>('select');
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [statusText, setStatusText] = useState('');

  const [evalText, setEvalText] = useState('');
  const [evalScore, setEvalScore] = useState<number | null>(null);
  const [evalStages, setEvalStages] = useState<Record<string, number> | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [quota, setQuota] = useState<{ used: number; limit: number; remaining: number; plan?: string } | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const azureRecognizerRef = useRef<any>(null);
  const speechBufferRef = useRef('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<QueueItem[]>([]);
  const isPlayingRef = useRef(false);
  const historyRef = useRef<HistoryTurn[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => { historyRef.current = history; }, [history]);

  useEffect(() => {
    const userStr = localStorage.getItem('ishla_user');
    if (!userStr) { window.location.href = '/?login=1'; return; }
    setIsAuthChecking(false);
    fetch('/api/simulator/start').then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && !d.error) setQuota(d); }).catch(() => {});
  }, []);

  // ---------- TTS queue ----------
  const processQueue = () => {
    if (isPlayingRef.current) return;
    const next = audioQueueRef.current[0];
    if (!next) { setIsSpeaking(false); return; }
    if (next.failed) { audioQueueRef.current.shift(); processQueue(); return; }
    if (!next.ready) return;
    isPlayingRef.current = true;
    setIsSpeaking(true);
    const audio = new Audio(next.audioUrl!);
    audioRef.current = audio;
    const done = () => { audioQueueRef.current.shift(); isPlayingRef.current = false; processQueue(); };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  };

  const enqueueSpeech = (text: string, voiceName?: string) => {
    if (!text.trim()) return;
    const item: QueueItem = { id: generateId(), text, audioUrl: null, ready: false, failed: false };
    audioQueueRef.current.push(item);
    const voice = voiceName || CHARACTERS.find((c) => c.id === selectedCharacter)?.voice || 'uz-UZ-MadinaNeural';
    const url = `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`;
    // Fetch the audio, retrying once on failure so a transient hiccup doesn't
    // leave the call silent ("no response").
    const attempt = (tries: number) => {
      fetch(url)
        .then((res) => { if (!res.ok) throw new Error('tts'); return res.blob(); })
        .then((blob) => { item.audioUrl = URL.createObjectURL(blob); item.ready = true; processQueue(); })
        .catch(() => { if (tries > 0) setTimeout(() => attempt(tries - 1), 400); else { item.failed = true; processQueue(); } });
    };
    attempt(1);
  };

  const clearAudioQueue = () => {
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsSpeaking(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  };

  // ---------- STT (tap to talk) ----------
  const stopRecognizer = () => {
    if (azureRecognizerRef.current) {
      try { azureRecognizerRef.current.stopContinuousRecognitionAsync(); azureRecognizerRef.current.close(); } catch {}
      azureRecognizerRef.current = null;
    }
    setIsListening(false);
  };

  const startListening = async () => {
    if (isLoading || isSpeaking) return;
    try {
      speechBufferRef.current = '';
      const tokenRes = await fetch('/api/speech-token');
      if (!tokenRes.ok) throw new Error('token');
      const { token, region } = await tokenRes.json();
      const sdk = await import('microsoft-cognitiveservices-speech-sdk');
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = 'uz-UZ';
      const recognizer = new sdk.SpeechRecognizer(speechConfig, sdk.AudioConfig.fromDefaultMicrophoneInput());
      recognizer.recognized = (_s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text) {
          speechBufferRef.current = (speechBufferRef.current ? speechBufferRef.current + ' ' : '') + e.result.text;
          setStatusText(speechBufferRef.current);
        }
      };
      recognizer.canceled = () => stopRecognizer();
      recognizer.startContinuousRecognitionAsync();
      azureRecognizerRef.current = recognizer;
      setIsListening(true);
      setStatusText('Tinglayapman...');
    } catch {
      setIsListening(false);
      alert('Mikrofonga ulanishда xatolik. Azure sozlamalarini tekshiring.');
    }
  };

  const stopAndSend = () => {
    const text = speechBufferRef.current.trim();
    stopRecognizer();
    if (text) { setStatusText(''); sendVoice(text); }
    else setStatusText('Eshitilmadi — mikrofonni bosib qaytadan gapiring');
  };

  const toggleMic = () => { if (isListening) stopAndSend(); else startListening(); };

  // ---------- Send a turn (voice only, no transcript shown) ----------
  const sendVoice = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    clearAudioQueue();
    const newUser: HistoryTurn = { role: 'user', content: text };
    const baseHistory = [...historyRef.current];
    let fullText = '';
    let sentenceBuffer = '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, character: selectedCharacter, history: baseHistory }),
      });
      if (!res.body) throw new Error('no_stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          const json = JSON.parse(part.slice(6));
          if (json.error) throw new Error(json.error);
          if (json.done) continue;
          if (json.text) {
            fullText += json.text;
            sentenceBuffer += json.text;
            const { sentences, rest } = extractCompleteSentences(sentenceBuffer);
            sentences.forEach((s) => enqueueSpeech(s));
            sentenceBuffer = rest;
          }
        }
      }
      if (sentenceBuffer.trim()) enqueueSpeech(sentenceBuffer);
      if (fullText.trim()) {
        setHistory([...baseHistory, newUser, { role: 'assistant', content: fullText }]);
      } else {
        // Model returned nothing — don't leave the call silent.
        enqueueSpeech('Uzr, eshitmadim. Qaytadan aytib yuboring.');
        setHistory([...baseHistory, newUser]);
      }
    } catch {
      enqueueSpeech('Uzr, aloqa uzildi. Qaytadan gapiring.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Start / end call ----------
  const startCall = async (characterId: string) => {
    try {
      const res = await fetch('/api/simulator/start', { method: 'POST' });
      if (res.status === 402) { const d = await res.json(); setQuota({ used: d.used, limit: d.limit, remaining: 0, plan: d.plan }); setPaywallOpen(true); return; }
      if (res.ok) setQuota(await res.json());
      else if (res.status === 401) { window.location.href = '/?login=1'; return; }
    } catch { /* allow through */ }

    const char = CHARACTERS.find((c) => c.id === characterId)!;
    setSelectedCharacter(characterId);
    setHistory([{ role: 'assistant', content: char.greeting }]);
    setEvalText(''); setEvalScore(null);
    setCallState('active');
    setCallSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    enqueueSpeech(char.greeting, char.voice);
  };

  const endCall = async () => {
    stopRecognizer();
    clearAudioQueue();
    if (timerRef.current) clearInterval(timerRef.current);
    const convo = historyRef.current.filter((m) => m.role === 'user');
    if (convo.length === 0) {
      // No real conversation — just return to selection.
      setCallState('select');
      setSelectedCharacter(null);
      return;
    }
    setEvaluating(true);
    setCallState('ended');
    let fullText = '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'STOP', character: selectedCharacter, history: historyRef.current }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n'); buffer = parts.pop() || '';
        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          const json = JSON.parse(part.slice(6));
          if (json.text) fullText += json.text;
        }
      }
      const m = fullText.match(/JAMI\s*BALL[^\d]{0,6}(\d+)/i);
      const score = m ? Math.min(100, Math.max(0, parseInt(m[1], 10))) : null;
      const stages = parseStagesFromText(fullText);
      setEvalText(fullText);
      setEvalScore(score);
      setEvalStages(stages);
      if (score != null) {
        const char = CHARACTERS.find((c) => c.id === selectedCharacter);
        fetch('/api/practice', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ persona: selectedCharacter, personaName: char?.name, score, stageScores: stages, feedback: fullText }),
        }).catch(() => {});
      }
    } catch {
      setEvalText('Baholab bo\'lmadi. Qaytadan urinib ko\'ring.');
    } finally {
      setEvaluating(false);
    }
  };

  const backToSelect = () => {
    setCallState('select'); setSelectedCharacter(null); setHistory([]);
    setEvalText(''); setEvalScore(null); setEvalStages(null);
    fetch('/api/simulator/start').then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && !d.error) setQuota(d); }).catch(() => {});
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); stopRecognizer(); clearAudioQueue(); }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const activeChar = CHARACTERS.find((c) => c.id === selectedCharacter);

  if (isAuthChecking) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0d14', color: '#fff' }}>Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen text-white" style={{ background: 'radial-gradient(ellipse at top, #1a1f35 0%, #0b0d14 60%)' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ringPulse{0%{transform:scale(1);opacity:.7;}70%{transform:scale(1.35);opacity:0;}100%{opacity:0;}}
        @keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5);}50%{box-shadow:0 0 0 14px rgba(239,68,68,0);}}
        .avatar-ring::before,.avatar-ring::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid rgba(129,140,248,.6);animation:ringPulse 2s ease-out infinite;}
        .avatar-ring::after{animation-delay:1s;}
        .mic-live{animation:micPulse 1.4s ease-out infinite;}
        .call-avatar-fallback{display:flex;align-items:center;justify-content:center;font-weight:700;font-family:serif;}
      `}} />

      <div className="max-w-md mx-auto min-h-screen flex flex-col px-5 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/vacansiy" className="text-sm text-slate-400 hover:text-white">← Kabinet</Link>
          {quota && callState === 'select' && (
            <span className="text-xs text-slate-400">
              {quota.plan === 'premium' ? '⭐ Premium' : <>Bugun qolgan: <b className={quota.remaining > 0 ? 'text-emerald-400' : 'text-rose-400'}>{quota.remaining}</b>/{quota.limit}</>}
            </span>
          )}
        </div>

        {/* SELECT */}
        {callState === 'select' && (
          <div className="flex-1">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">AI Sotuv qo&apos;ng&apos;iroq mashqi</h1>
              <p className="text-slate-400 text-sm mt-1">Mijozni tanlang va unga qo&apos;ng&apos;iroq qiling</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {CHARACTERS.map((c) => (
                <button key={c.id} onClick={() => startCall(c.id)}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition text-left">
                  <Avatar char={c} size={52} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-slate-400 truncate">{c.description}</div>
                  </div>
                  <span className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE CALL */}
        {callState === 'active' && activeChar && (
          <div className="flex-1 flex flex-col items-center justify-between py-6">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className={`relative ${isSpeaking ? 'avatar-ring' : ''}`} style={{ marginBottom: 24 }}>
                <Avatar char={activeChar} size={148} />
              </div>
              <h2 className="text-2xl font-bold">{activeChar.name}</h2>
              <p className="text-slate-400 mt-1">{fmt(callSeconds)}</p>
              <p className="text-sm mt-4 h-6 text-center px-6 truncate max-w-full" style={{ color: isSpeaking ? '#a5b4fc' : isListening ? '#fca5a5' : '#94a3b8' }}>
                {isSpeaking ? '🔊 gapiryapti...' : isLoading ? 'javob tayyorlayapti...' : isListening ? '🎤 tinglayapman — tugatib yuborish uchun bosing' : 'gapirish uchun mikrofonni bosing'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-8 pb-4">
              <button onClick={toggleMic} disabled={isLoading || isSpeaking}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition disabled:opacity-40 ${isListening ? 'bg-rose-600 mic-live' : 'bg-white/10 ring-1 ring-white/20 hover:bg-white/20'}`}
                title="Gapirish">
                {isListening
                  ? <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                  : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4"/></svg>}
              </button>
              <button onClick={endCall} className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center" title="Tugatish">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" style={{ transform: 'rotate(135deg)' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* ENDED — evaluation */}
        {callState === 'ended' && activeChar && (
          <div className="flex-1 flex flex-col items-center py-4">
            <Avatar char={activeChar} size={80} />
            <h2 className="text-xl font-bold mt-3">{activeChar.name} bilan suhbat yakunlandi</h2>
            {evaluating ? (
              <p className="text-slate-400 mt-6 animate-pulse">AI baholayapti...</p>
            ) : (
              <>
                {evalScore != null && (
                  <div className="mt-4 mb-2 text-center">
                    <div className="text-5xl font-bold" style={{ color: evalScore >= 80 ? '#34d399' : evalScore >= 60 ? '#fbbf24' : '#f87171' }}>{evalScore}<span className="text-2xl text-slate-500">/100</span></div>
                    <div className="text-xs text-slate-400 mt-1">standart sotuv skripti bo&apos;yicha</div>
                  </div>
                )}
                {evalStages && (
                  <div className="w-full mt-4 p-4 rounded-xl bg-white/5 ring-1 ring-white/10">
                    <div className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">Bosqichlar bo&apos;yicha</div>
                    {STAGE_META.map((s) => {
                      const val = evalStages[s.key] ?? 0;
                      const pct = Math.round((val / s.max) * 100);
                      const barColor = pct >= 75 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171';
                      return (
                        <div key={s.key} className="mb-2.5">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300">{s.label}</span>
                            <span className="font-mono text-slate-400">{val}/{s.max}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="w-full mt-3 p-4 rounded-xl bg-white/5 ring-1 ring-white/10 text-sm whitespace-pre-wrap leading-relaxed text-slate-200">
                  {evalText}
                </div>
                <button onClick={backToSelect} className="mt-5 mb-4 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500">
                  Yangi qo&apos;ng&apos;iroq
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Paywall */}
      {paywallOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={(e) => { if (e.target === e.currentTarget) setPaywallOpen(false); }}>
          <div className="bg-[#131722] ring-1 ring-white/10 rounded-2xl max-w-sm w-full p-7 text-center">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-xl font-bold mb-2">Bugungi bepul mashqlar tugadi</h3>
            <p className="text-slate-400 text-sm mb-6">Bugun {quota?.limit ?? ''} ta bepul qo&apos;ng&apos;iroqdan foydalandingiz. Cheksiz mashq uchun Premiumga o&apos;ting yoki ertaga qayting.</p>
            <button className="px-5 py-2.5 rounded-xl font-bold bg-white/5 ring-1 ring-white/10" onClick={() => setPaywallOpen(false)}>Yopish</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Realistic avatar with graceful fallback to initials if the photo fails to load.
function Avatar({ char, size }: { char: Character; size: number }) {
  const [err, setErr] = useState(false);
  const bg = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'][char.id.length % 5];
  if (err) {
    return (
      <div className="call-avatar-fallback rounded-full" style={{ width: size, height: size, background: bg, fontSize: size * 0.4, color: '#fff' }}>
        {char.name.charAt(0)}
      </div>
    );
  }
  return (
    <img src={char.avatar} alt={char.name} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,.12)' }} />
  );
}
