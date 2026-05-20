import { readFile } from 'node:fs/promises';
import { fetchGitHubOrg, writeGitHubCache, type GitHubCache } from '@oss-atlas/core';
import { githubCachePath, resolveCwd, type CommonOptions } from '../paths.js';

export interface SyncOptions extends CommonOptions {
  org?: string;
  token?: string;
  fixture?: string;
}

export async function syncCommand(options: SyncOptions): Promise<void> {
  const cwd = resolveCwd(options);
  const org = options.org;
  const token = options.token ?? process.env.GITHUB_TOKEN;
  const output = githubCachePath(cwd);

  const cache = options.fixture
    ? await loadFixture(options.fixture)
    : await fetchGitHubOrg({ org: requireOrg(org), token });

  await writeGitHubCache(output, cache);
  console.log(`Synced ${cache.repos.length} repositories into ${output}`);
}

function requireOrg(org?: string): string {
  if (!org) {
    throw new Error('Missing --org. Example: oss-atlas sync --org BSSM-OSS');
  }
  return org;
}

async function loadFixture(path: string): Promise<GitHubCache> {
  return JSON.parse(await readFile(path, 'utf8')) as GitHubCache;
}
