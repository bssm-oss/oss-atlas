import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const checks = [
  {
    file: 'apps/web/dist/index.html',
    expected: [
      'Open Source Atlas',
      'Featured Projects',
      'Contribution Tags',
      'atlas-web',
      'good first issue'
    ]
  },
  {
    file: 'apps/web/dist/projects/atlas-web/index.html',
    expected: [
      'Project Detail',
      'atlas-web',
      'Contribution Atlas',
      'documentation',
      'accessibility'
    ]
  }
];

for (const check of checks) {
  const path = resolve(check.file);
  const html = await readFile(path, 'utf8');

  for (const expected of check.expected) {
    if (!html.includes(expected)) {
      throw new Error(`${check.file} does not include expected content: ${expected}`);
    }
  }
}

console.log('Static site output verified.');
