import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { readAtlas, renderMarkdownReport } from '@oss-atlas/core';
import { atlasCachePath, distPath, resolveCwd, type CommonOptions } from '../paths.js';

export interface ReportOptions extends CommonOptions {
  input?: string;
  output?: string;
}

export async function reportCommand(options: ReportOptions): Promise<void> {
  const cwd = resolveCwd(options);
  const input = options.input ?? atlasCachePath(cwd);
  const output = options.output ?? distPath(cwd, 'REPORT.md');
  const atlas = await readAtlas(input);
  const report = renderMarkdownReport(atlas);

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, report, 'utf8');
  console.log(`Wrote ${output}`);
}
