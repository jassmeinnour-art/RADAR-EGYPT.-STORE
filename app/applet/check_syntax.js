const fs = require('fs');
let code = fs.readFileSync('src/components/PlatformConnectionModal.tsx', 'utf8');

let cleanCode = '';
let inString = null;
let escape = false;

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  if (inString) {
    if (escape) {
      escape = false;
    } else if (c === '\\') {
      escape = true;
    } else if (c === inString) {
      inString = null;
    }
    cleanCode += ' ';
  } else {
    if (c === '"' || c === "'" || c === '`') {
      inString = c;
      cleanCode += ' ';
    } else {
      cleanCode += c;
    }
  }
}

const lines = cleanCode.split('\n');
let stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === '(' || ch === '{') {
      stack.push({ char: ch, line: i + 1, col: j + 1 });
    } else if (ch === ')' || ch === '}') {
      if (stack.length) {
        stack.pop();
      } else {
        console.log('Stack empty popped by', ch, 'at line', i + 1, 'col', j + 1);
      }
    }
  }
  if (stack.length === 0 && i > 90 && i < lines.length - 2) {
    console.log('Stack unexpectedly reached 0 at line', i + 1, ':', lines[i].trim());
  }
}
