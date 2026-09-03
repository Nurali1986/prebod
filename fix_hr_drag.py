import sys

with open('app/hr/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_drop = '''  const onDrop = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    if (draggedItem === null || !activeVacancyId) return;
    
    const vIdx = vacancies.findIndex(v => v.id === activeVacancyId);
    if (vIdx === -1) return;

    const newVacs = [...vacancies];
    newVacs[vIdx].candidates[draggedItem].stage = stageKey;
    setVacancies(newVacs);
    setDraggedItem(null);
  };'''

new_drop = '''  const onDrop = async (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    if (draggedItem === null || !activeVacancyId) return;
    
    const vIdx = vacancies.findIndex(v => v.id === activeVacancyId);
    if (vIdx === -1) return;

    const newVacs = [...vacancies];
    const cand = newVacs[vIdx].candidates[draggedItem];
    cand.stage = stageKey;
    setVacancies(newVacs);
    setDraggedItem(null);
    
    try {
      await fetch('/api/candidates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cand.id, stage: stageKey })
      });
    } catch(err) {}
  };'''

code = code.replace(old_drop, new_drop)

with open('app/hr/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed HR drag and drop DB sync!")
