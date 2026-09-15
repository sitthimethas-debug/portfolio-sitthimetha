const fs = require('fs');

const content = fs.readFileSync('portfolio.html', 'utf8');
const regex = /(?:href|src|data-src)="([^"]+)"/g;
let m, count = 0, missing = 0;

while ((m = regex.exec(content)) !== null) {
  const url = m[1];
  if (!url.startsWith('http') && !url.startsWith('#') && !url.startsWith('data:')) {
    count++;
    if (!fs.existsSync(url)) {
      console.log('MISSING FILE:', url);
      missing++;
    }
  }
}

console.log(`Validation complete. Total checked: ${count}, Missing: ${missing}`);
