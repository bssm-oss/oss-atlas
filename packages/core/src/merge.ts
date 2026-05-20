import { atlasSchema, type Atlas, type AtlasProject, type Catalog, type CatalogEntry, type GitHubCache, type GitHubRepo } from './schema.js';

const contributionTopicMap = new Map([
  ['good-first-issue', 'good first issue'],
  ['good first issues', 'good first issue'],
  ['help-wanted', 'help wanted'],
  ['help wanted', 'help wanted'],
  ['beginner-friendly', 'beginner friendly'],
  ['beginner friendly', 'beginner friendly'],
  ['needs-maintainer', 'needs maintainer'],
  ['needs maintainer', 'needs maintainer']
]);

export function buildAtlas(catalog: Catalog, github: GitHubCache): Atlas {
  const warnings: string[] = [];
  const reposByName = new Map(github.repos.map((repo) => [repo.name, repo]));

  for (const repoName of Object.keys(catalog.repos)) {
    if (!reposByName.has(repoName)) {
      warnings.push(`catalog.yml contains '${repoName}', but it was not found in GitHub metadata.`);
    }
  }

  const projects = github.repos
    .map((repo) => mergeProject(repo, catalog.repos[repo.name]))
    .sort(compareProjects);

  const categoryCounts = new Map<string, number>();
  for (const project of projects) {
    categoryCounts.set(project.category, (categoryCounts.get(project.category) ?? 0) + 1);
  }

  return atlasSchema.parse({
    generatedAt: new Date().toISOString(),
    organization: catalog.organization,
    warnings,
    stats: {
      totalRepos: projects.length,
      featuredRepos: projects.filter((project) => project.featured).length,
      activeRepos: projects.filter((project) => project.status === 'active').length,
      contributionReadyRepos: projects.filter((project) => project.contribution.length > 0 || project.contributionSignals.length > 0).length,
      archivedRepos: projects.filter((project) => project.status === 'archived').length
    },
    projects,
    categories: [...categoryCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  });
}

function mergeProject(repo: GitHubRepo, entry?: CatalogEntry): AtlasProject {
  const contributionSignals = extractContributionSignals(repo.topics);
  const category = entry?.category ?? repo.language ?? 'uncategorized';
  const status = entry?.status ?? inferStatus(repo);

  return {
    ...repo,
    pitch: entry?.pitch ?? repo.description ?? 'No project pitch yet.',
    featured: entry?.featured ?? false,
    category,
    status,
    maintainers: entry?.maintainers ?? [],
    contribution: entry?.contribution ?? [],
    contributionSignals,
    difficulty: entry?.difficulty,
    techStack: entry?.techStack ?? [],
    relatedRepos: entry?.relatedRepos ?? []
  };
}

function extractContributionSignals(topics: string[]): string[] {
  const signals = new Set<string>();
  for (const topic of topics) {
    const normalized = topic.toLowerCase().replaceAll('_', '-');
    const signal = contributionTopicMap.get(normalized) ?? contributionTopicMap.get(normalized.replaceAll('-', ' '));
    if (signal) {
      signals.add(signal);
    }
  }
  return [...signals].sort();
}

function inferStatus(repo: GitHubRepo): AtlasProject['status'] {
  if (repo.archived) {
    return 'archived';
  }

  const updatedAt = new Date(repo.pushedAt ?? repo.updatedAt).getTime();
  const daysSinceUpdate = (Date.now() - updatedAt) / 86_400_000;
  return daysSinceUpdate <= 180 ? 'active' : 'maintenance';
}

function compareProjects(a: AtlasProject, b: AtlasProject): number {
  return Number(b.featured) - Number(a.featured)
    || statusRank(a.status) - statusRank(b.status)
    || Number(hasContribution(b)) - Number(hasContribution(a))
    || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    || b.stars - a.stars
    || a.name.localeCompare(b.name);
}

function statusRank(status: AtlasProject['status']): number {
  if (status === 'active') {
    return 0;
  }
  if (status === 'maintenance') {
    return 1;
  }
  return 2;
}

function hasContribution(project: AtlasProject): boolean {
  return project.contribution.length > 0 || project.contributionSignals.length > 0;
}
