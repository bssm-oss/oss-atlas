import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildAtlas,
  createStarterCatalog,
  fetchGitHubOrg,
  loadCatalog,
  readGitHubCache,
  renderMarkdownReport,
  writeCatalog
} from '../packages/core/src/index.ts';
import type { GitHubCache } from '../packages/core/src/index.ts';

const fixturePath = resolve('test/fixtures/github-org-repos.json');
const exampleCatalogPath = resolve('examples/bssm-oss/catalog.yml');

describe('catalog handling', () => {
  it('loads curated catalog metadata from YAML', async () => {
    const catalog = await loadCatalog(exampleCatalogPath);

    expect(catalog.organization.name).toBe('BSSM-OSS');
    expect(catalog.repos.maru).toMatchObject({
      featured: true,
      category: 'product',
      status: 'active',
      difficulty: 'medium'
    });
    expect(catalog.repos.maru?.contribution).toEqual(['frontend', 'backend', 'docs']);
  });

  it('rejects invalid catalog values', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'oss-atlas-invalid-catalog-'));
    const catalogPath = join(dir, 'catalog.yml');
    await writeFile(catalogPath, 'organization:\n  name: BSSM-OSS\nrepos:\n  maru:\n    status: experimental\n', 'utf8');

    await expect(loadCatalog(catalogPath)).rejects.toThrow();
  });

  it('writes a starter catalog that can be read back', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'oss-atlas-starter-catalog-'));
    const catalogPath = join(dir, 'catalog.yml');

    await writeCatalog(catalogPath, createStarterCatalog('BSSM-OSS', 'School OSS organization'));
    const catalog = await loadCatalog(catalogPath);

    expect(catalog).toEqual({
      organization: {
        name: 'BSSM-OSS',
        description: 'School OSS organization'
      },
      repos: {}
    });
  });
});

describe('GitHub metadata', () => {
  it('reads fixture cache through the schema', async () => {
    const github = await readGitHubCache(fixturePath);

    expect(github.organization).toBe('BSSM-OSS');
    expect(github.repos).toHaveLength(3);
    expect(github.repos[0]).toMatchObject({
      name: 'maru',
      fullName: 'BSSM-OSS/maru',
      stars: 42,
      topics: ['good-first-issue', 'school', 'service']
    });
  });

  it('normalizes paginated GitHub API responses', async () => {
    const pages = [
      Array.from({ length: 100 }, (_, index) => githubApiRepo(`repo-${index}`)),
      [githubApiRepo('final-repo')]
    ];
    const requestedUrls: string[] = [];
    const fetchImpl: typeof fetch = async (input) => {
      const url = input instanceof URL ? input : new URL(String(input));
      requestedUrls.push(url.toString());
      const page = Number(url.searchParams.get('page'));
      return new Response(JSON.stringify(pages[page - 1] ?? []), { status: 200 });
    };

    const cache = await fetchGitHubOrg({ org: 'BSSM-OSS', token: 'test-token', fetchImpl });

    expect(cache.organization).toBe('BSSM-OSS');
    expect(cache.repos).toHaveLength(101);
    expect(cache.repos.at(-1)).toMatchObject({
      name: 'final-repo',
      fullName: 'BSSM-OSS/final-repo',
      license: 'MIT',
      homepageUrl: null
    });
    expect(requestedUrls).toHaveLength(2);
  });
});

describe('atlas composition', () => {
  it('merges catalog curation with GitHub metadata', async () => {
    const catalog = await loadCatalog(exampleCatalogPath);
    const github = await readGitHubCache(fixturePath);

    const atlas = buildAtlas(catalog, github);
    const maru = atlas.projects.find((project) => project.name === 'maru');
    const oldLab = atlas.projects.find((project) => project.name === 'old-lab');

    expect(atlas.organization.name).toBe('BSSM-OSS');
    expect(atlas.stats).toMatchObject({
      totalRepos: 3,
      featuredRepos: 2,
      activeRepos: 2,
      contributionReadyRepos: 2,
      archivedRepos: 1
    });
    expect(maru).toMatchObject({
      pitch: '입학 원서 작성 및 제출 서비스',
      featured: true,
      category: 'product',
      contribution: ['frontend', 'backend', 'docs'],
      contributionSignals: ['good first issue'],
      difficulty: 'medium'
    });
    expect(oldLab).toMatchObject({
      status: 'archived',
      category: 'Python',
      contribution: [],
      contributionSignals: []
    });
  });

  it('renders a Markdown report with featured and contribution sections', async () => {
    const atlas = buildAtlas(await loadCatalog(exampleCatalogPath), await readGitHubCache(fixturePath));

    const report = renderMarkdownReport(atlas);

    expect(report).toContain('# BSSM-OSS Projects');
    expect(report).toContain('## Featured');
    expect(report).toContain('[maru](https://github.com/BSSM-OSS/maru)');
    expect(report).toContain('## Contribution Map');
    expect(report).toContain('maru: frontend, backend, docs, good first issue, medium');
    expect(report).toContain('- product: 1');
  });
});

function githubApiRepo(name: string) {
  return {
    name,
    full_name: `BSSM-OSS/${name}`,
    description: `Description for ${name}`,
    stargazers_count: 1,
    forks_count: 0,
    language: 'TypeScript',
    archived: false,
    updated_at: '2026-05-17T00:00:00.000Z',
    pushed_at: '2026-05-17T00:00:00.000Z',
    topics: ['help-wanted'],
    license: { spdx_id: 'MIT', name: 'MIT License' },
    html_url: `https://github.com/BSSM-OSS/${name}`,
    homepage: ''
  };
}
