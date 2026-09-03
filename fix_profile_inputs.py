import sys

with open('app/vacansiy/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add state variables
states_code = """
  const [rPatronymic, setRPatronymic] = useState('');
  const [rBirthDate, setRBirthDate] = useState('');
  const [rGender, setRGender] = useState('');
  const [rCity, setRCity] = useState('');
  const [rAddress, setRAddress] = useState('');
  const [rPhone, setRPhone] = useState('');
  const [rCitizenship, setRCitizenship] = useState('');
"""
code = code.replace("const [rFio, setRFio] = useState('');", "const [rFio, setRFio] = useState('');" + states_code)

# Add to saveProfile
code = code.replace(
    "pIsm, pFam, rFio, profilePhoto",
    "pIsm, pFam, rFio, profilePhoto, rPatronymic, rBirthDate, rGender, rCity, rAddress, rPhone, rCitizenship"
)

# Add to useEffect load
load_code = """
          if (parsed.profileData.rPatronymic) setRPatronymic(parsed.profileData.rPatronymic);
          if (parsed.profileData.rBirthDate) setRBirthDate(parsed.profileData.rBirthDate);
          if (parsed.profileData.rGender) setRGender(parsed.profileData.rGender);
          if (parsed.profileData.rCity) setRCity(parsed.profileData.rCity);
          if (parsed.profileData.rAddress) setRAddress(parsed.profileData.rAddress);
          if (parsed.profileData.rPhone) setRPhone(parsed.profileData.rPhone);
          if (parsed.profileData.rCitizenship) setRCitizenship(parsed.profileData.rCitizenship);
"""
code = code.replace("if (parsed.profileData.rFio) setRFio(parsed.profileData.rFio);", "if (parsed.profileData.rFio) setRFio(parsed.profileData.rFio);" + load_code)

# Replace inputs in UI
replaces = [
    ('<div className="field"><label>Otasining ismi</label><input type="text" placeholder="Ixtiyoriy" /></div>',
     '<div className="field"><label>Otasining ismi</label><input type="text" placeholder="Ixtiyoriy" value={rPatronymic} onChange={e => setRPatronymic(e.target.value)} /></div>'),
    
    ('<div className="field"><label>Tug\'ilgan sana</label><input type="date" /></div>',
     '<div className="field"><label>Tug\'ilgan sana</label><input type="date" value={rBirthDate} onChange={e => setRBirthDate(e.target.value)} /></div>'),

    ('<select><option>Tanlang</option><option>Erkak</option><option>Ayol</option></select>',
     '<select value={rGender} onChange={e => setRGender(e.target.value)}><option>Tanlang</option><option>Erkak</option><option>Ayol</option></select>'),

    ('<div className="field"><label>Yashash manzili (shahar)</label><input type="text" placeholder="Toshkent" /></div>',
     '<div className="field"><label>Yashash manzili (shahar)</label><input type="text" placeholder="Toshkent" value={rCity} onChange={e => setRCity(e.target.value)} /></div>'),

    ('<div className="field"><label>Telefon raqami</label><input type="tel" placeholder="+998 90 123 45 67" /></div>',
     '<div className="field"><label>Telefon raqami</label><input type="tel" placeholder="+998 90 123 45 67" value={rPhone} onChange={e => setRPhone(e.target.value)} /></div>'),

    ('<div className="field"><label>Yashash manzili</label><input type="text" placeholder="Toshkent, Uzbekistan" /></div>',
     '<div className="field"><label>Yashash manzili</label><input type="text" placeholder="Toshkent, Uzbekistan" value={rAddress} onChange={e => setRAddress(e.target.value)} /></div>'),

    ('<div className="field"><label>Telefon</label><input type="tel" placeholder="+998 90 123 45 67" onChange={e => setContactOk(e.target.value.length > 5)} /></div>',
     '<div className="field"><label>Telefon</label><input type="tel" placeholder="+998 90 123 45 67" value={rPhone} onChange={e => { setRPhone(e.target.value); setContactOk(e.target.value.length > 5); }} /></div>'),
     
    ('<div className="field"><label>Fuqaroligi</label><input type="text" placeholder="O\'zbekiston" /></div>',
     '<div className="field"><label>Fuqaroligi</label><input type="text" placeholder="O\'zbekiston" value={rCitizenship} onChange={e => setRCitizenship(e.target.value)} /></div>')
]

for old_str, new_str in replaces:
    code = code.replace(old_str, new_str)

with open('app/vacansiy/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed profile inputs!")
