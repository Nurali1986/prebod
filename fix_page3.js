const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');
code = code.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';");
fs.writeFileSync('app/page.tsx', code);
console.log('Added useEffect import to page.tsx');
