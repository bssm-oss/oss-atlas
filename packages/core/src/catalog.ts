import { readFile, writeFile } from 'node:fs/promises';
import { parse, stringify } from 'yaml';
import { catalogSchema, type Catalog } from './schema.js';

export async function loadCatalog(path: string): Promise<Catalog> {
  const raw = await readFile(path, 'utf8');
  const parsed = parse(raw) as unknown;
  return catalogSchema.parse(parsed);
}

export function createStarterCatalog(organization: string, description?: string): Catalog {
  return {
    organization: {
      name: organization,
      ...(description ? { description } : {})
    },
    repos: {}
  };
}

export async function writeCatalog(path: string, catalog: Catalog): Promise<void> {
  const content = stringify(catalog, {
    lineWidth: 100,
    indentSeq: false
  });
  await writeFile(path, content, 'utf8');
}
