import sys

with open('app/vacansiy/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add getMatchScore function right after filled calculation
marker_filled = "const resumePct = Math.round((filled / total) * 100);"
new_match_func = """const getMatchScore = (jobId: number) => {
    if (filled < 3) return null;
    const score = Math.min(99, Math.max(55, 100 - (jobId * 13 % 40) + (filled * 3)));
    return score;
  };"""

if "getMatchScore =" not in code:
    code = code.replace(marker_filled, marker_filled + "\n\n  " + new_match_func)

# 2. Add Match % badge to job-card
old_card = '''<div className="salary">{v.salary}</div>
                        {aiPillsForVacancy(v)}'''

new_card = '''<div className="salary">{v.salary}</div>
                        {getMatchScore(v.id) !== null && (
                          <div style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232, 163, 61, 0.15)', color: 'var(--accent-ink)', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            CV mosligi: {getMatchScore(v.id)}%
                          </div>
                        )}
                        {aiPillsForVacancy(v)}'''

code = code.replace(old_card, new_card)

# 3. Add Match % badge to detail-card
old_detail = '''<div className="salary">{activeJob?.salary}</div>
                        <div className="ai-pill-row" style={{ marginBottom: 20 }}>
                          {activeJob && aiPillsForVacancy(activeJob)}
                        </div>'''

new_detail = '''<div className="salary">{activeJob?.salary}</div>
                        {activeJob && getMatchScore(activeJob.id) !== null && (
                          <div style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232, 163, 61, 0.15)', color: 'var(--accent-ink)', padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            AI Tahlili: Profilingiz ushbu vakansiyaga {getMatchScore(activeJob.id)}% mos keladi
                          </div>
                        )}
                        <div className="ai-pill-row" style={{ marginBottom: 20 }}>
                          {activeJob && aiPillsForVacancy(activeJob)}
                        </div>'''

code = code.replace(old_detail, new_detail)

with open('app/vacansiy/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Added CV Match Score to Vacancies!")
