const fs = require('fs');

let code = fs.readFileSync('app/api/analyze-cv/route.ts', 'utf8');

code = code.replace(
  `const scoreStr = response.choices[0].message.content?.replace(/\\D/g, '') || '0';`,
  `const aiResponseText = response.choices[0].message.content || '0';
    console.log("=== AI PROMPT ===");
    console.log(prompt);
    console.log("=== AI RESPONSE ===");
    console.log(aiResponseText);
    const scoreStr = aiResponseText.replace(/\\D/g, '');`
);

fs.writeFileSync('app/api/analyze-cv/route.ts', code);
console.log('Added debugging');
