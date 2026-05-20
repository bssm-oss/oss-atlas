import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { buildAtlas, loadCatalog, readGitHubCache, renderMarkdownReport, writeAtlas } from '@oss-atlas/core';
import { atlasCachePath, catalogPath, distPath, githubCachePath, resolveCwd, workspaceRoot, type CommonOptions } from '../paths.js';

export interface GenerateOptions extends CommonOptions {
  catalog?: string;
  github?: string;
  skipSite?: boolean;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const cwd = resolveCwd(options);
  const root = workspaceRoot();
  const catalog = await loadCatalog(options.catalog ?? catalogPath(cwd));
  const github = await readGitHubCache(options.github ?? githubCachePath(cwd));
  const atlas = buildAtlas(catalog, github);

  const atlasCache = atlasCachePath(cwd);
  const atlasDist = distPath(cwd, 'atlas.json');
  const reportDist = distPath(cwd, 'REPORT.md');
  const webGenerated = resolve(root, 'apps/web/src/generated/atlas.json');

  await writeAtlas(atlasCache, atlas);

  if (!options.skipSite) {
    await writeAtlas(webGenerated, atlas);
    await buildWeb(root);
    await copyWebDist(root, cwd);
  }

  await writeAtlas(atlasDist, atlas);
  await mkdir(dirname(reportDist), { recursive: true });
  await import('node:fs/promises').then(({ writeFile }) => writeFile(reportDist, renderMarkdownReport(atlas), 'utf8'));

  console.log(`Generated atlas for ${atlas.organization.name}: ${atlas.projects.length} projects`);
}

async function buildWeb(root: string): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn('pnpm', ['--filter', '@oss-atlas/web', 'build'], {
      cwd: root,
      stdio: 'inherit'
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(new Error(`Astro build failed with exit code ${code ?? 'unknown'}`));
      }
    });
  });
}

export async function copyWebDist(root: string, cwd: string): Promise<void> {
  const webDist = resolve(root, 'apps/web/dist');
  const output = resolve(cwd, 'dist');
  await rm(output, { recursive: true, force: true });
  await mkdir(dirname(output), { recursive: true });
  await cp(webDist, output, { recursive: true });
}
