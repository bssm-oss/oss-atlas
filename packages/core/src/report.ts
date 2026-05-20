import type { Atlas, AtlasProject } from './schema.js';

export function renderMarkdownReport(atlas: Atlas): string {
  const featured = atlas.projects.filter((project) => project.featured);
  const active = atlas.projects.filter((project) => project.status === 'active');
  const contributionReady = atlas.projects.filter((project) => project.contribution.length > 0 || project.contributionSignals.length > 0);

  return [
    `# ${atlas.organization.name} Projects`,
    '',
    atlas.organization.description ?? '',
    '',
    '## Overview',
    '',
    `- Total repositories: ${atlas.stats.totalRepos}`,
    `- Featured projects: ${atlas.stats.featuredRepos}`,
    `- Active projects: ${atlas.stats.activeRepos}`,
    `- Contribution-ready projects: ${atlas.stats.contributionReadyRepos}`,
    '',
    '## Featured',
    '',
    renderProjectList(featured),
    '',
    '## Active Projects',
    '',
    renderProjectList(active),
    '',
    '## Contribution Map',
    '',
    renderContributionList(contributionReady),
    '',
    '## Categories',
    '',
    ...atlas.categories.map((category) => `- ${category.name}: ${category.count}`),
    '',
    atlas.warnings.length > 0 ? '## Warnings' : '',
    atlas.warnings.length > 0 ? '' : '',
    ...atlas.warnings.map((warning) => `- ${warning}`),
    ''
  ].filter((line, index, lines) => !(line === '' && lines[index - 1] === '')).join('\n');
}

function renderProjectList(projects: AtlasProject[]): string {
  if (projects.length === 0) {
    return '- No projects yet.';
  }

  return projects.map((project) => {
    const details = [project.status, project.category, project.language].filter(Boolean).join(' / ');
    return `- [${project.name}](${project.url}) - ${project.pitch} (${details})`;
  }).join('\n');
}

function renderContributionList(projects: AtlasProject[]): string {
  if (projects.length === 0) {
    return '- No contribution-ready projects yet.';
  }

  return projects.map((project) => {
    const labels = [...project.contribution, ...project.contributionSignals];
    const difficulty = project.difficulty ? `, ${project.difficulty}` : '';
    return `- ${project.name}: ${labels.join(', ')}${difficulty}`;
  }).join('\n');
}
