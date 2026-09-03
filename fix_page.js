const fs = require('fs');

let code = fs.readFileSync('app/vacansiy/page.tsx', 'utf8');

// 1. Prevent copy/paste in open questions
const oldTextArea = '<textarea rows={4} value={draft.openAnswers[qi] || \'\'} onChange={e => setDraft({ ...draft, openAnswers: { ...draft.openAnswers, [qi]: e.target.value } })} placeholder="Javobingizni yozing..." />';
const newTextArea = '<textarea rows={4} value={draft.openAnswers[qi] || \'\'} onChange={e => setDraft({ ...draft, openAnswers: { ...draft.openAnswers, [qi]: e.target.value } })} onPaste={e => e.preventDefault()} onCopy={e => e.preventDefault()} onCut={e => e.preventDefault()} placeholder="Javobingizni o\'z so\'zlaringiz bilan yozing (nusxalash taqiqlangan)..." />';
code = code.replace(oldTextArea, newTextArea);

// 2. Connect sendChat to API
const oldSendChat = `  const sendChat = () => {
    if (!chatInput.trim()) return;
    const newLog = [...draft.salesLog, { from: 'me', text: chatInput.trim() }];
    const newTurn = draft.salesTurn + 1;
    
    let nextScore = null;
    if (newTurn < 3) {
      newLog.push({ from: 'ai', text: AI_REBUTTALS[newTurn - 1] });
    } else {
      newLog.push({ from: 'ai', text: AI_REBUTTALS[2] });
      const totalChars = newLog.filter((m: any) => m.from === 'me').reduce((s: number, m: any) => s + m.text.length, 0);
      nextScore = Math.min(97, Math.max(55, 58 + Math.round(totalChars / 8)));
    }

    setDraft({ ...draft, salesLog: newLog, salesTurn: newTurn, salesScore: nextScore });
    setChatInput('');
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 50);
  };`;

const newSendChat = `  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const newLog = [...draft.salesLog, { from: 'me', text: chatInput.trim() }];
    const newTurn = draft.salesTurn + 1;
    
    setDraft({ ...draft, salesLog: newLog, salesTurn: newTurn });
    setChatInput('');
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 50);

    const v = vacancies.find(x => x.id === draft.vacancyId);
    if (!v) return;

    if (newTurn < 3) {
      // API call to simulate customer
      try {
        const res = await fetch('/api/chat-simulator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            history: newLog,
            product: v.aiConfig.sales.product,
            personaId: draft.activePersonaId
          })
        });
        const data = await res.json();
        const updatedLog = [...newLog, { from: 'ai', text: data.reply }];
        setDraft(prev => ({ ...prev, salesLog: updatedLog }));
        setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 50);
      } catch (err) {
        console.error(err);
      }
    } else {
      // End of chat, get evaluation
      try {
        const res = await fetch('/api/chat-simulator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            history: newLog,
            product: v.aiConfig.sales.product,
            personaId: draft.activePersonaId,
            finalEval: true
          })
        });
        const data = await res.json();
        const updatedLog = [...newLog, { from: 'ai', text: "Suhbat yakunlandi. AI baholashi:\\n" + data.feedback }];
        setDraft(prev => ({ ...prev, salesLog: updatedLog, salesScore: data.score }));
        setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 50);
      } catch (err) {
        console.error(err);
        setDraft(prev => ({ ...prev, salesScore: 75 }));
      }
    }
  };`;
code = code.replace(oldSendChat, newSendChat);

// 3. Update overall rating calculation in submitVideo / review
const oldPayload = `const payload = {
      name: candidateName === 'Ism kiritilmagan' ? "Yangi Nomzod" : candidateName,
      role: candidateRole === 'Lavozim ko\\'rsatilmagan' ? v.title : candidateRole,
      match: draft.cvScore || 0,`;

const newPayload = `
    let finalMatch = draft.cvScore || 0;
    if (v.aiConfig.sales.enabled && draft.salesScore) {
      // 60% weight on sales score, 20% cv, 20% test
      let testWeight = draft.testScore ? 0.2 : 0;
      let cvWeight = 0.2;
      let salesWeight = 0.6 + (draft.testScore ? 0 : 0.2); // redistribute if no test
      finalMatch = Math.round((draft.cvScore || 0) * cvWeight + (draft.testScore || 0) * testWeight + draft.salesScore * salesWeight);
    }

    const payload = {
      name: candidateName === 'Ism kiritilmagan' ? "Yangi Nomzod" : candidateName,
      role: candidateRole === 'Lavozim ko\\'rsatilmagan' ? v.title : candidateRole,
      match: finalMatch,`;
code = code.replace(oldPayload, newPayload);

fs.writeFileSync('app/vacansiy/page.tsx', code);
console.log('Fixed page.tsx');
