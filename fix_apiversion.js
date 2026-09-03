const fs = require('fs');

const files = ['app/api/analyze-cv/route.ts', 'app/api/chat-simulator/route.ts'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(`defaultQuery: { 'api-version': '2024-02-15-preview' },`, '');
  code = code.replace(`defaultHeaders: { 'api-key': azureApiKey },`, `defaultHeaders: { 'api-key': azureApiKey, 'Authorization': \`Bearer \${azureApiKey}\` },`);
  fs.writeFileSync(file, code);
}
console.log('Fixed API version issue');
