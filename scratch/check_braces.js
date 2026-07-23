const fs = require('fs');
const code = fs.readFileSync('src/pages/ProductDetailPage.tsx', 'utf8');

const stack = [];
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '(' || char === '{' || char === '[') {
      stack.push({ char, line: i + 1, col: j + 1 });
    } else if (char === ')' || char === '}' || char === ']') {
      if (stack.length === 0) {
        console.log(`Extra closing ${char} at line ${i + 1}, col ${j + 1}`);
        continue;
      }
      const last = stack[stack.length - 1];
      if (
        (char === ')' && last.char === '(') ||
        (char === '}' && last.char === '{') ||
        (char === ']' && last.char === '[')
      ) {
        stack.pop();
      } else {
        console.log(`Mismatched ${char} at line ${i + 1}, col ${j + 1} matching ${last.char} from line ${last.line}, col ${last.col}`);
        // pop to try and continue
        stack.pop();
      }
    }
  }
}

if (stack.length > 0) {
  console.log('Unclosed brackets/braces/parentheses:');
  for (const item of stack) {
    console.log(`Unclosed ${item.char} at line ${item.line}, col ${item.col}`);
  }
} else {
  console.log('No mismatched brackets found by simple stack parser.');
}
