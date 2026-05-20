import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { atlasSchema, githubCacheSchema, type Atlas, type GitHubCache } from './schema.js';

export async function readGitHubCache(path: string): Promise<GitHubCache> {
  const raw = await readFile(path, 'utf8');
  return githubCacheSchema.parse(JSON.parse(raw));
}

export async function writeGitHubCache(path: string, cache: GitHubCache): Promise<void> {
  await writeJson(path, cache);
}

export async function readAtlas(path: string): Promise<Atlas> {
  const raw = await readFile(path, 'utf8');
  return atlasSchema.parse(JSON.parse(raw));
}

export async function writeAtlas(path: string, atlas: Atlas): Promise<void> {
  await writeJson(path, atlas);
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
