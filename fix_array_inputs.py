import sys

with open('app/vacansiy/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

updateListCode = '''
  const updateList = (listName: string, id: number, field: string, val: any) => {
    if (listName === 'expList') setExpList(prev => prev.map(x => x.id === id ? { ...x, [field]: val } : x));
    if (listName === 'eduList') setEduList(prev => prev.map(x => x.id === id ? { ...x, [field]: val } : x));
    if (listName === 'langList') setLangList(prev => prev.map(x => x.id === id ? { ...x, [field]: val } : x));
  };
'''

marker = "const startApply = (id: number) => {"
if "updateList =" not in code:
    insertPos = code.find(marker)
    if insertPos != -1:
        code = code[:insertPos] + updateListCode + '\n  ' + code[insertPos:]

replaces = [
    ('<div className="field"><label>Kompaniya nomi</label><input type="text" placeholder="Masalan: Tez Tour LLC" /></div>',
     '<div className="field"><label>Kompaniya nomi</label><input type="text" placeholder="Masalan: Tez Tour LLC" value={exp.company || ""} onChange={e => updateList("expList", exp.id, "company", e.target.value)} /></div>'),

    ('<div className="field"><label>Lavozim</label><input type="text" placeholder="Masalan: Marketing bo\'yicha mutaxassis" /></div>',
     '<div className="field"><label>Lavozim</label><input type="text" placeholder="Masalan: Marketing bo\'yicha mutaxassis" value={exp.role || ""} onChange={e => updateList("expList", exp.id, "role", e.target.value)} /></div>'),

    ('<div className="field"><label>Ish boshlangan sana</label><input type="date" /></div>',
     '<div className="field"><label>Ish boshlangan sana</label><input type="date" value={exp.startDate || ""} onChange={e => updateList("expList", exp.id, "startDate", e.target.value)} /></div>'),

    ('<div className="field"><label>Ish tugagan sana</label><input type="date" /><span className="hint">Hozirgacha ishlayotgan bo\'lsangiz bo\'sh qoldiring</span></div>',
     '<div className="field"><label>Ish tugagan sana</label><input type="date" value={exp.endDate || ""} onChange={e => updateList("expList", exp.id, "endDate", e.target.value)} /><span className="hint">Hozirgacha ishlayotgan bo\'lsangiz bo\'sh qoldiring</span></div>'),

    ('<div className="field full"><label>Faoliyat sohasi</label><input type="text" placeholder="Masalan: IT, Marketing, Moliya" /></div>',
     '<div className="field full"><label>Faoliyat sohasi</label><input type="text" placeholder="Masalan: IT, Marketing, Moliya" value={exp.industry || ""} onChange={e => updateList("expList", exp.id, "industry", e.target.value)} /></div>'),

    ('<div className="field full"><label>Vazifalar va yutuqlar tavsifi</label><textarea placeholder="Asosiy vazifalaringiz va erishgan natijalaringizni tavsiflang"></textarea></div>',
     '<div className="field full"><label>Vazifalar va yutuqlar tavsifi</label><textarea placeholder="Asosiy vazifalaringiz va erishgan natijalaringizni tavsiflang" value={exp.desc || ""} onChange={e => updateList("expList", exp.id, "desc", e.target.value)}></textarea></div>'),

    ('<div className="field full"><label>Ta\'lim muassasasi</label><input type="text" placeholder="Masalan: Toshkent Axborot Texnologiyalari Universiteti" /></div>',
     '<div className="field full"><label>Ta\'lim muassasasi</label><input type="text" placeholder="Masalan: Toshkent Axborot Texnologiyalari Universiteti" value={edu.inst || ""} onChange={e => updateList("eduList", edu.id, "inst", e.target.value)} /></div>'),

    ('<select><option value="">Tanlang</option><option>O\'rta maxsus</option><option>Bakalavr</option><option>Magistr</option><option>PhD</option></select>',
     '<select value={edu.degree || ""} onChange={e => updateList("eduList", edu.id, "degree", e.target.value)}><option value="">Tanlang</option><option>O\'rta maxsus</option><option>Bakalavr</option><option>Magistr</option><option>PhD</option></select>'),

    ('<div className="field"><label>Mutaxassislik</label><input type="text" placeholder="Masalan: Dasturiy injiniring" /></div>',
     '<div className="field"><label>Mutaxassislik</label><input type="text" placeholder="Masalan: Dasturiy injiniring" value={edu.spec || ""} onChange={e => updateList("eduList", edu.id, "spec", e.target.value)} /></div>'),

    ('<div className="field"><label>Bitirgan yili</label><input type="number" placeholder="2024" /></div>',
     '<div className="field"><label>Bitirgan yili</label><input type="number" placeholder="2024" value={edu.year || ""} onChange={e => updateList("eduList", edu.id, "year", e.target.value)} /></div>'),

    ('<select><option value="">Tanlang</option><option>O\'zbek</option><option>Rus</option><option>Ingliz</option><option>Turk</option></select>',
     '<select value={lang.name || ""} onChange={e => updateList("langList", lang.id, "name", e.target.value)}><option value="">Tanlang</option><option>O\'zbek</option><option>Rus</option><option>Ingliz</option><option>Turk</option></select>'),

    ('<select><option value="">Tanlang</option><option>Ona tili</option><option>C2 (Mukammal)</option><option>C1 (Erkin)</option><option>B2 (Yaxshi)</option><option>B1 (O\'rtacha)</option></select>',
     '<select value={lang.level || ""} onChange={e => updateList("langList", lang.id, "level", e.target.value)}><option value="">Tanlang</option><option>Ona tili</option><option>C2 (Mukammal)</option><option>C1 (Erkin)</option><option>B2 (Yaxshi)</option><option>B1 (O\'rtacha)</option></select>')
]

for old_str, new_str in replaces:
    code = code.replace(old_str, new_str)

with open('app/vacansiy/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed array inputs via Python!")
