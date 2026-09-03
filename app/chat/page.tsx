// app/chat/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface HistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface QueueItem {
  id: string;
  text: string;
  audioUrl: string | null;
  ready: boolean;
  failed: boolean;
}

const CHARACTERS = [
  { id: 'ishonmaydigan', name: 'Rustam (Ishonchsiz)', voice: 'uz-UZ-SardorNeural', emoji: '🤨', description: 'Hech kimga ishonmaydi', color: 'from-rose-500 to-red-600', greeting: 'Alo, assalomu alaykum. Eshitaman.' },
  { id: 'band', name: 'Sardor (Band Rahbar)', voice: 'uz-UZ-SardorNeural', emoji: '⏱️', description: 'Vaqti yo\'q, shoshyapti', color: 'from-orange-500 to-amber-600', greeting: 'Alo, assalomu alaykum. Kim bu?' },
  { id: 'buhgalter', name: 'Madina (Buhgalter)', voice: 'uz-UZ-MadinaNeural', emoji: '🧮', description: 'Faqat raqamlarga qaraydi', color: 'from-blue-500 to-cyan-600', greeting: 'Assalomu alaykum. Eshitaman sizni.' },
  { id: 'bazorchi', name: 'Aziza (Narx Talashuvchi)', voice: 'uz-UZ-MadinaNeural', emoji: '💸', description: 'Doim chegirma so\'raydi', color: 'from-yellow-500 to-orange-500', greeting: 'Alo, assalomu alaykum. Qanaqa masala edi?' },
  { id: 'bilagon', name: 'Jasur (Ekspert)', voice: 'uz-UZ-SardorNeural', emoji: '🧠', description: 'Hammasini "biladi"', color: 'from-purple-500 to-indigo-600', greeting: 'Assalomu alaykum. Xo\'sh, qanday masalada telefon qildingiz?' },
  { id: 'ikkilanuvchi', name: 'Nigora (Ikkilanuvchi)', voice: 'uz-UZ-MadinaNeural', emoji: '🤔', description: 'Qaror berolmaydi', color: 'from-teal-500 to-emerald-600', greeting: 'Alo... Assalomu alaykum, eshityapman.' },
  { id: 'achchiq', name: 'Tohir (Asabiy)', voice: 'uz-UZ-SardorNeural', emoji: '😠', description: 'Oldin yomon tajriba bo\'lgan', color: 'from-red-600 to-rose-700', greeting: 'Alo, assalomu alaykum. Siz kimsiz?' },
  { id: 'muloyim_sust', name: 'Zarina (Muloyim)', voice: 'uz-UZ-MadinaNeural', emoji: '🙂', description: 'Hammaga "ha" deydi', color: 'from-pink-400 to-fuchsia-500', greeting: 'Assalomu alaykum! Eshitaman, marhamat.' },
  { id: 'raqobatchi', name: 'Sanjar (Sodiq Mijoz)', voice: 'uz-UZ-SardorNeural', emoji: '🤝', description: 'Boshqa firma bilan ishlaydi', color: 'from-slate-500 to-slate-700', greeting: 'Alo, assalomu alaykum. Nima deysiz?' },
  { id: 'yangi', name: 'Sevara (Yangi Mijoz)', voice: 'uz-UZ-MadinaNeural', emoji: '🌱', description: 'Sohani umuman bilmaydi', color: 'from-green-500 to-lime-600', greeting: 'Assalomu alaykum. Eshitaman, gapiravering.' },
];

const generateId = () => 'id-' + Math.random().toString(36).substring(2, 15);

function extractCompleteSentences(buffer: string): { sentences: string[]; rest: string } {
  const matches = buffer.match(/[^.!?]*[.!?]+[\s"')\]]*/g);
  if (!matches) return { sentences: [], rest: buffer };
  const consumed = matches.join('');
  const rest = buffer.slice(consumed.length);
  return { sentences: matches.map((s) => s.trim()).filter(Boolean), rest };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<HistoryTurn[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [quota, setQuota] = useState<{ used: number; limit: number; remaining: number; plan?: string } | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('ishla_user');
    if (!userStr) {
      window.location.href = '/?login=1';
      return;
    }
    setIsAuthChecking(false);
    // Load today's remaining free simulator quota.
    fetch('/api/simulator/start')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && !d.error) setQuota(d); })
      .catch(() => {});
  }, []);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const azureRecognizerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<QueueItem[]>([]);
  const isPlayingRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------- TTS Queue ----------
  const processQueue = () => {
    if (isPlayingRef.current) return;
    const next = audioQueueRef.current[0];
    if (!next) {
      setIsSpeaking(false);
      return;
    }
    if (next.failed) {
      audioQueueRef.current.shift();
      processQueue();
      return;
    }
    if (!next.ready) return;

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const audio = new Audio(next.audioUrl!);
    audioRef.current = audio;
    audio.onended = () => {
      audioQueueRef.current.shift();
      isPlayingRef.current = false;
      processQueue();
    };
    audio.onerror = () => {
      audioQueueRef.current.shift();
      isPlayingRef.current = false;
      processQueue();
    };
    audio.play().catch(() => {
      audioQueueRef.current.shift();
      isPlayingRef.current = false;
      processQueue();
    });
  };

  const enqueueSpeech = (text: string, voiceName?: string) => {
    if (!isTtsEnabled || !text.trim()) return;
    const item: QueueItem = { id: generateId(), text, audioUrl: null, ready: false, failed: false };
    audioQueueRef.current.push(item);

    const activeCharacterVoice = voiceName || CHARACTERS.find((c) => c.id === selectedCharacter)?.voice || 'uz-UZ-MadinaNeural';

    fetch(`/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(activeCharacterVoice)}`)
      .then((res) => {
        if (!res.ok) throw new Error('tts_failed');
        return res.blob();
      })
      .then((blob) => {
        item.audioUrl = URL.createObjectURL(blob);
        item.ready = true;
        processQueue();
      })
      .catch(() => {
        item.failed = true;
        processQueue();
      });
  };

  const clearAudioQueue = () => {
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsSpeaking(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  // ---------- STT (Azure) ----------
  const toggleListening = async () => {
    if (isListening) {
      if (azureRecognizerRef.current) {
        azureRecognizerRef.current.stopContinuousRecognitionAsync();
        azureRecognizerRef.current.close();
        azureRecognizerRef.current = null;
      }
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      const tokenRes = await fetch('/api/speech-token');
      if (!tokenRes.ok) throw new Error('Token error');
      const { token, region } = await tokenRes.json();

      const speechsdk = await import('microsoft-cognitiveservices-speech-sdk');
      const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = 'uz-UZ';

      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

      recognizer.recognized = (s, e) => {
        if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
          setInput((prev) => (prev ? prev + ' ' : '') + e.result.text);
        }
      };
      recognizer.canceled = () => {
        setIsListening(false);
        try { recognizer.close(); } catch {}
        azureRecognizerRef.current = null;
      };
      recognizer.sessionStopped = () => {
        setIsListening(false);
        try { recognizer.close(); } catch {}
        azureRecognizerRef.current = null;
      };

      recognizer.startContinuousRecognitionAsync();
      azureRecognizerRef.current = recognizer;
    } catch (err) {
      console.error(err);
      setIsListening(false);
      alert('Mikrofonga ulanishda xatolik. Azure sozlamalarini tekshiring.');
    }
  };

  // ---------- Character select ----------
  const handleCharacterSelect = async (characterId: string) => {
    // Server-side daily limit check — counts this as one session.
    try {
      const res = await fetch('/api/simulator/start', { method: 'POST' });
      if (res.status === 402) {
        const d = await res.json();
        setQuota({ used: d.used, limit: d.limit, remaining: 0, plan: d.plan });
        setPaywallOpen(true);
        return;
      }
      if (res.ok) {
        const d = await res.json();
        setQuota(d);
      } else if (res.status === 401) {
        window.location.href = '/?login=1';
        return;
      }
    } catch { /* allow through on network hiccup */ }

    const char = CHARACTERS.find((c) => c.id === characterId)!;
    setSelectedCharacter(characterId);
    setHasStarted(true);
    setHistory([]);
    setMessages([{ id: generateId(), role: 'ai', content: char.greeting }]);
    enqueueSpeech(char.greeting, char.voice);
  };

  // ---------- Send message (streaming) ----------
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (isListening && azureRecognizerRef.current) {
      azureRecognizerRef.current.stopContinuousRecognitionAsync();
      azureRecognizerRef.current.close();
      azureRecognizerRef.current = null;
      setIsListening(false);
    }

    const currentInput = input;
    const isStop = currentInput.toUpperCase() === 'STOP';

    setMessages((prev) => [...prev, { id: generateId(), role: 'user', content: currentInput }]);
    setInput('');
    setIsLoading(true);
    clearAudioQueue();

    const aiMsgId = generateId();
    setMessages((prev) => [...prev, { id: aiMsgId, role: 'ai', content: '' }]);

    let fullText = '';
    let sentenceBuffer = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, character: selectedCharacter, history }),
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
            // eslint-disable-next-line
            fullText += json.text;
            // eslint-disable-next-line
            sentenceBuffer += json.text;
            
            const currentFullText = fullText;
            setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, content: currentFullText } : m)));

            const { sentences, rest } = extractCompleteSentences(sentenceBuffer);
            if (!isStop) {
              sentences.forEach((s) => enqueueSpeech(s));
            }
            sentenceBuffer = rest;
          }
        }
      }

      if (sentenceBuffer.trim() && !isStop) enqueueSpeech(sentenceBuffer);

      if (isStop) {
        setHistory([]);
        // Parse "JAMI BALL: X/100" from the standard-script evaluation and save
        // this practice session so the candidate's sales mastery is tracked.
        const m = fullText.match(/JAMI\s*BALL[^\d]{0,6}(\d+)/i);
        if (m) {
          const score = Math.min(100, Math.max(0, parseInt(m[1], 10)));
          const char = CHARACTERS.find((c) => c.id === selectedCharacter);
          try {
            await fetch('/api/practice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ persona: selectedCharacter, personaName: char?.name, score, feedback: fullText }),
            });
            setMessages((prev) => [...prev, { id: generateId(), role: 'ai', content: `✅ Natija saqlandi — umumiy sotuv mahoratingiz: ${score}%. Kabinetingizdagi "Sotuv mahorati" bo'limida ko'rishingiz mumkin.` }]);
          } catch { /* ignore save errors */ }
        }
      } else {
        setHistory((prev) => [
          ...prev,
          { role: 'user', content: currentInput },
          { role: 'assistant', content: fullText },
        ]);
      }
    } catch (error) {
      console.error('Xatolik:', error);
      const errText = 'Xatolik yuz berdi. Iltimos qaytadan urinib koring.';
      setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, content: errText } : m)));
      enqueueSpeech(errText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetSession = () => {
    setHasStarted(false);
    setMessages([]);
    setHistory([]);
    setSelectedCharacter(null);
    clearAudioQueue();
    if (azureRecognizerRef.current) {
      azureRecognizerRef.current.stopContinuousRecognitionAsync();
      azureRecognizerRef.current.close();
      azureRecognizerRef.current = null;
      setIsListening(false);
    }
  };

  const activeChar = CHARACTERS.find((c) => c.id === selectedCharacter);

  if (isAuthChecking) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#FAFAFA'}}>Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen bg-[#0b0d14] text-white bg-[radial-gradient(ellipse_at_top,_#1a1f35_0%,_#0b0d14_60%)]">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-lg">←</span> Bosh sahifa
          </Link>
          {hasStarted && (
            <button
              onClick={resetSession}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ↺ Xarakterni almashtirish
            </button>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            AI Savdo Trener
          </h1>
          <p className="text-slate-400">Virtual mijozlar bilan real vaziyatlarni mashq qiling</p>
        </div>

        {!hasStarted && (
          <div className="mb-8">
            {quota && (
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 text-slate-300">
                  {quota.plan === 'premium'
                    ? <>⭐ Premium — cheksiz mashq</>
                    : <>Bugun qolgan bepul mashqlar: <b className={quota.remaining > 0 ? 'text-emerald-400' : 'text-rose-400'}>{quota.remaining}</b> / {quota.limit}</>}
                </span>
              </div>
            )}
            <h2 className="text-lg font-semibold mb-5 text-center text-slate-300">
              Mijoz xarakterini tanlang
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => handleCharacterSelect(char.id)}
                  className={`bg-gradient-to-br ${char.color} p-5 rounded-2xl text-left shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-white/10`}
                >
                  <div className="text-3xl mb-2">{char.emoji}</div>
                  <div className="font-bold mb-1">{char.name}</div>
                  <div className="text-sm opacity-90">{char.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {hasStarted && activeChar && (
          <div className="bg-[#131722]/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
            <div className={`bg-gradient-to-r ${activeChar.color} p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{activeChar.emoji}</div>
                <div>
                  <div className="font-bold">{activeChar.name}</div>
                  <div className="text-xs opacity-90 flex items-center gap-1.5">
                    {isSpeaking ? (
                      <>
                        <span className="flex gap-0.5 items-end h-3">
                          <span className="w-0.5 bg-white/90 animate-[bounce_0.8s_ease-in-out_infinite] h-2"></span>
                          <span className="w-0.5 bg-white/90 animate-[bounce_0.8s_ease-in-out_infinite_0.15s] h-3"></span>
                          <span className="w-0.5 bg-white/90 animate-[bounce_0.8s_ease-in-out_infinite_0.3s] h-1.5"></span>
                        </span>
                        gapiryapti...
                      </>
                    ) : (
                      'tinglayapti'
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setIsTtsEnabled((v) => !v);
                    if (isTtsEnabled) clearAudioQueue();
                  }}
                  className="text-sm hover:opacity-75 transition-opacity"
                  title="Ovozli o'qish"
                >
                  {isTtsEnabled ? '🔊' : '🔇'}
                </button>
              </div>
            </div>

            <div className="h-[28rem] overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={
                      'max-w-[75%] p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ' +
                      (msg.role === 'user'
                        ? 'bg-indigo-600 rounded-br-sm'
                        : 'bg-[#1e2334] rounded-bl-sm ring-1 ring-white/5')
                    }
                  >
                    {msg.content || (
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-[#0f1219] ring-1 ring-white/5">
              <div className="flex gap-2">
                <button
                  onClick={toggleListening}
                  className={`p-3 rounded-xl font-bold transition-all ${
                    isListening
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse text-white'
                      : 'bg-[#1e2334] hover:bg-[#262c40] text-white ring-1 ring-white/10'
                  }`}
                  title="Mikrofon"
                >
                  {isListening ? '🛑' : '🎤'}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Xabaringizni yozing yoki mikrofonga gapiring..."
                  className="flex-1 bg-[#1e2334] text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ring-1 ring-white/10 placeholder:text-slate-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-3 rounded-xl font-bold transition-all"
                >
                  →
                </button>
              </div>
              <div className="text-xs text-slate-500 mt-2 text-center">
                Suhbatni yakunlash uchun <span className="text-slate-300 font-medium">STOP</span> deb yozing
              </div>
            </div>
          </div>
        )}
      </div>

      {paywallOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) setPaywallOpen(false); }}>
          <div className="bg-[#131722] ring-1 ring-white/10 rounded-2xl max-w-md w-full p-7 text-center">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-xl font-bold mb-2">Bugungi bepul mashqlar tugadi</h3>
            <p className="text-slate-400 text-sm mb-6">
              Siz bugun {quota?.limit ?? ''} ta bepul AI-mashqdan foydalandingiz. Cheksiz mashq qilish uchun Premiumga o&apos;ting yoki ertaga qaytib keling — limit har kuni yangilanadi.
            </p>
            <div className="flex gap-3 justify-center">
              <button className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white" onClick={() => alert('Premium tez orada — to\'lov tizimi ulanmoqda. Hozircha administrator orqali faollashtiriladi.')}>Premium olish</button>
              <button className="px-5 py-2.5 rounded-xl font-bold bg-white/5 ring-1 ring-white/10 text-slate-300" onClick={() => setPaywallOpen(false)}>Yopish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}