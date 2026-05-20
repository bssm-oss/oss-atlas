import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { copyWebDist, generateCommand } from '../packages/cli/src/commands/generate.ts';
import { initCommand } from '../packages/cli/src/commands/init.ts';
import { reportCommand } from '../packages/cli/src/commands/report.ts';
import { syncCommand } from '../packages/cli/src/commands/sync.ts';

const fixturePath = resolve('test/fixtures/github-org-repos.json');
const exampleCatalogPath = resolve('examples/bssm-oss/catalog.yml');

describe('CLI commands', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  it('initializes a starter catalog in a target directory', async () => {
    const cwd = await testDir('init');

    await initCommand({ cwd, org: 'BSSM-OSS', description: 'School OSS organization' });

    const catalog = await readFile(join(cwd, 'catalog.yml'), 'utf8');
    expect(catalog).toContain('name: BSSM-OSS');
    expect(catalog).toContain('description: School OSS organization');
    await expect(initCommand({ cwd, org: 'BSSM-OSS' })).rejects.toThrow('already exists');
  });

  it('syncs fixture metadata without calling GitHub', async () => {
    const cwd = await testDir('sync');

    await syncCommand({ cwd, fixture: fixturePath });

    const cache = JSON.parse(await readFile(join(cwd, '.oss-atlas/github.json'), 'utf8')) as {
      organization: string;
      repos: Array<{ name: string }>;
    };
    expect(cache.organization).toBe('BSSM-OSS');
    expect(cache.repos.map((repo) => repo.name)).toEqual(['maru', 'jagalchi', 'old-lab']);
  });

  it('generates atlas JSON and Markdown report from catalog plus fixture metadata', async () => {
    const cwd = await testDir('generate');

    await initCommand({ cwd, org: 'placeholder' });
    await copyText(exampleCatalogPath, join(cwd, 'catalog.yml'));
    await syncCommand({ cwd, fixture: fixturePath });
    await generateCommand({ cwd, skipSite: true });

    const atlas = JSON.parse(await readFile(join(cwd, 'dist/atlas.json'), 'utf8')) as {
      organization: { name: string };
      projects: Array<{ name: string; contribution: string[]; contributionSignals: string[] }>;
    };
    const report = await readFile(join(cwd, 'dist/REPORT.md'), 'utf8');

    expect(atlas.organization.name).toBe('BSSM-OSS');
    expect(atlas.projects.find((project) => project.name === 'maru')).toMatchObject({
      contribution: ['frontend', 'backend', 'docs'],
      contributionSignals: ['good first issue']
    });
    expect(report).toContain('## Contribution Map');
    expect(report).toContain('maru: frontend, backend, docs, good first issue, medium');
    await expect(stat(join(cwd, '.oss-atlas/atlas.json'))).resolves.toBeTruthy();
  });

  it('renders a report from an existing atlas cache', async () => {
    const cwd = await testDir('report');

    await copyText(exampleCatalogPath, join(cwd, 'catalog.yml'));
    await syncCommand({ cwd, fixture: fixturePath });
    await generateCommand({ cwd, skipSite: true });
    await reportCommand({ cwd, output: join(cwd, 'custom-report.md') });

    const report = await readFile(join(cwd, 'custom-report.md'), 'utf8');
    expect(report).toContain('# BSSM-OSS Projects');
    expect(report).toContain('## Active Projects');
  });

  it('replaces stale static site files when copying web output', async () => {
    const root = await testDir('web-root');
    const cwd = await testDir('site-output');

    await mkdir(join(cwd, 'dist/projects/removed-project'), { recursive: true });
    await mkdir(join(root, 'apps/web/dist/projects/current-project'), { recursive: true });
    await writeFile(join(cwd, 'dist/projects/removed-project/index.html'), 'stale project', 'utf8');
    await writeFile(join(root, 'apps/web/dist/index.html'), 'current index', 'utf8');
    await writeFile(join(root, 'apps/web/dist/projects/current-project/index.html'), 'current project', 'utf8');

    await copyWebDist(root, cwd);

    await expect(readFile(join(cwd, 'dist/index.html'), 'utf8')).resolves.toBe('current index');
    await expect(readFile(join(cwd, 'dist/projects/current-project/index.html'), 'utf8')).resolves.toBe('current project');
    await expect(readFile(join(cwd, 'dist/projects/removed-project/index.html'), 'utf8')).rejects.toThrow();
  });
});

async function testDir(name: string): Promise<string> {
  const dir = join(tmpdir(), `oss-atlas-${name}-${crypto.randomUUID()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

async function copyText(from: string, to: string): Promise<void> {
  await mkdir(dirname(to), { recursive: true });
  await import('node:fs/promises').then(async ({ writeFile }) => {
    await writeFile(to, await readFile(from, 'utf8'), 'utf8');
  });
}
