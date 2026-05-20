#!/usr/bin/env node
import { cac } from 'cac';
import { generateCommand } from './commands/generate.js';
import { initCommand } from './commands/init.js';
import { reportCommand } from './commands/report.js';
import { syncCommand } from './commands/sync.js';

const cli = cac('oss-atlas');

cli
  .command('init', 'Create a starter catalog.yml')
  .option('--cwd <dir>', 'Target working directory')
  .option('--org <org>', 'GitHub organization name')
  .option('--description <text>', 'Organization description')
  .option('--force', 'Overwrite existing catalog.yml')
  .action(run(initCommand));

cli
  .command('sync', 'Fetch GitHub organization repository metadata')
  .option('--cwd <dir>', 'Target working directory')
  .option('--org <org>', 'GitHub organization name')
  .option('--token <token>', 'GitHub token. Defaults to GITHUB_TOKEN')
  .option('--fixture <path>', 'Read GitHub metadata from a local JSON fixture')
  .action(run(syncCommand));

cli
  .command('generate', 'Merge catalog and GitHub data, then build the static site')
  .option('--cwd <dir>', 'Target working directory')
  .option('--catalog <path>', 'Path to catalog.yml')
  .option('--github <path>', 'Path to GitHub cache JSON')
  .option('--skip-site', 'Generate JSON and report without running Astro')
  .action(run(generateCommand));

cli
  .command('report', 'Render a Markdown report from the generated atlas')
  .option('--cwd <dir>', 'Target working directory')
  .option('--input <path>', 'Path to atlas JSON')
  .option('--output <path>', 'Path to REPORT.md')
  .action(run(reportCommand));

cli.help();
cli.version('0.1.0');
cli.parse();

function run<T>(handler: (options: T) => Promise<void>) {
  return async (options: T) => {
    try {
      await handler(options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exitCode = 1;
    }
  };
}
