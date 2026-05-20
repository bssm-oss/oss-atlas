import { access, mkdir } from 'node:fs/promises';
import { createStarterCatalog, writeCatalog } from '@oss-atlas/core';
import { catalogPath, resolveCwd, type CommonOptions } from '../paths.js';

export interface InitOptions extends CommonOptions {
  org?: string;
  description?: string;
  force?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const cwd = resolveCwd(options);
  const org = options.org ?? 'my-org';
  const target = catalogPath(cwd);

  await mkdir(cwd, { recursive: true });

  if (!options.force && await exists(target)) {
    throw new Error(`catalog.yml already exists at ${target}. Use --force to overwrite it.`);
  }

  await writeCatalog(target, createStarterCatalog(org, options.description));
  console.log(`Created ${target}`);
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
