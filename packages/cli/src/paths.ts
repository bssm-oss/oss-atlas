import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export interface CommonOptions {
  cwd?: string;
}

export function resolveCwd(options: CommonOptions): string {
  return resolve(options.cwd ?? process.cwd());
}

export function workspaceRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return resolve(dirname(currentFile), '../../..');
}

export function catalogPath(cwd: string): string {
  return resolve(cwd, 'catalog.yml');
}

export function githubCachePath(cwd: string): string {
  return resolve(cwd, '.oss-atlas/github.json');
}

export function atlasCachePath(cwd: string): string {
  return resolve(cwd, '.oss-atlas/atlas.json');
}

export function distPath(cwd: string, name: string): string {
  return resolve(cwd, 'dist', name);
}
