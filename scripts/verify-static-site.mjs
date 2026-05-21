import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const checks = [
  {
    file: 'apps/web/dist/index.html',
    expected: [
      'Open Source Atlas',
      'Live Organization Explorer',
      'Map any public GitHub organization',
      'GitHub organization',
      'Featured Projects',
      'Contribution Tags',
      'atlas-web',
      'good first issue',
      'href="/oss-atlas/projects/atlas-web/"'
    ]
  },
  {
    file: 'apps/web/dist/projects/atlas-web/index.html',
    expected: [
      'Project Detail',
      'atlas-web',
      'Contribution Atlas',
      'documentation',
      'accessibility',
      'href="/oss-atlas/"'
    ]
  },
  {
    file: 'apps/web/dist/ko/index.html',
    expected: [
      '오픈소스 아틀라스',
      '실시간 조직 탐색기',
      '공개 GitHub 조직을 바로 살펴보기',
      'GitHub 조직',
      '조직 개요',
      '추천 프로젝트',
      '기여 태그',
      'href="/oss-atlas/ko/projects/atlas-web/"'
    ]
  },
  {
    file: 'apps/web/dist/ko/projects/atlas-web/index.html',
    expected: [
      '프로젝트 상세',
      '기여 아틀라스',
      '메인테이너',
      'href="/oss-atlas/ko/"',
      'href="/oss-atlas/projects/atlas-web/"'
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
