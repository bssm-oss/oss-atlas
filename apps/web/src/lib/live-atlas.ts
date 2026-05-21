import type { Atlas, AtlasProject } from '../types/atlas';

const GITHUB_ORG_REPOS_API = 'https://api.github.com/orgs';
const PER_PAGE = 100;
const CONTRIBUTION_TOPICS = new Set(['good-first-issue', 'help-wanted', 'needs-maintainer']);

export type GitHubOrganizationRepo = {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  archived: boolean;
  updated_at: string;
  pushed_at: string | null;
  topics?: string[];
  license: { spdx_id?: string | null; name?: string | null } | null;
  html_url: string;
  homepage: string | null;
};

export type FetchGitHubOrganizationReposOptions = {
  org: string;
  fetchImpl?: typeof fetch;
};

export type LiveAtlasRepo = {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  archived: boolean;
  updatedAt: string;
  pushedAt: string | null;
  topics: string[];
  license: string | null;
  url: string;
  homepageUrl: string | null;
};

export function normalizeOrganizationInput(input: string): string {
  const normalized = input.trim().toLowerCase();

  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(normalized)) {
    throw new Error('Enter a valid GitHub organization name.');
  }

  return normalized;
}

export async function fetchGitHubOrganizationRepos({
  org,
  fetchImpl = fetch
}: FetchGitHubOrganizationReposOptions): Promise<LiveAtlasRepo[]> {
  const organization = normalizeOrganizationInput(org);
  const repos: LiveAtlasRepo[] = [];

  for (let page = 1; ; page += 1) {
    const url = new URL(`${GITHUB_ORG_REPOS_API}/${encodeURIComponent(organization)}/repos`);
    url.searchParams.set('per_page', String(PER_PAGE));
    url.searchParams.set('page', String(page));
    url.searchParams.set('sort', 'updated');
    url.searchParams.set('direction', 'desc');
    url.searchParams.set('type', 'public');

    const response = await fetchImpl(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (response.status === 404) {
      throw new Error(`GitHub organization "${organization}" was not found.`);
    }

    if (response.status === 403) {
      throw new Error('GitHub rate limit exceeded. Try again later.');
    }

    if (!response.ok) {
      throw new Error(`Unable to load GitHub repositories for "${organization}".`);
    }

    const pageRepos = (await response.json()) as GitHubOrganizationRepo[];

    if (!Array.isArray(pageRepos) || pageRepos.length === 0) {
      break;
    }

    repos.push(...pageRepos.map((repo) => mapGitHubRepoToLiveAtlasRepo(organization, repo)));

    if (pageRepos.length < PER_PAGE && page > 1) {
      break;
    }

    if (pageRepos.length < PER_PAGE && page === 1) {
      continue;
    }
  }

  return repos;
}

export function buildLiveAtlas(orgInput: string, repos: GitHubOrganizationRepo[]): Atlas {
  const organization = normalizeOrganizationInput(orgInput);
  const projects = repos.map((repo) => mapGitHubRepoToAtlasProject(organization, repo));
  const categories = buildCategories(projects);
  const contributionReadyRepos = projects.filter((project) =>
    project.contributionSignals.some((signal) => CONTRIBUTION_TOPICS.has(signalToTopic(signal)))
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    organization: {
      name: organization,
      url: `https://github.com/${organization}`
    },
    stats: {
      totalRepos: projects.length,
      featuredRepos: 0,
      activeRepos: projects.filter((project) => project.status === 'active').length,
      contributionReadyRepos,
      archivedRepos: projects.filter((project) => project.archived).length
    },
    warnings: [],
    projects,
    categories
  };
}

export function buildContributionTags(projects: AtlasProject[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();

  for (const project of projects) {
    for (const signal of project.contributionSignals) {
      const name = signal.trim().toLowerCase();
      if (!CONTRIBUTION_TOPICS.has(name.replace(/\s+/g, '-'))) {
        continue;
      }

      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function mapGitHubRepoToLiveAtlasRepo(org: string, repo: GitHubOrganizationRepo): LiveAtlasRepo {
  return {
    name: repo.name,
    fullName: repo.full_name ?? `${org}/${repo.name}`,
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language ?? null,
    archived: repo.archived,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    topics: repo.topics ?? [],
    license: repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION'
      ? repo.license.spdx_id
      : repo.license?.name ?? null,
    url: repo.html_url,
    homepageUrl: repo.homepage || null
  };
}

function mapGitHubRepoToAtlasProject(org: string, repo: GitHubOrganizationRepo): AtlasProject {
  const contributionSignals = normalizeContributionSignals(repo.topics ?? []);
  const language = repo.language ?? null;
  const updatedAt = repo.updated_at;
  const pushedAt = repo.pushed_at;

  return {
    name: repo.name,
    fullName: repo.full_name ?? `${org}/${repo.name}`,
    description: repo.description,
    pitch: repo.description ?? 'No project pitch yet.',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language,
    archived: repo.archived,
    updatedAt,
    pushedAt,
    topics: repo.topics ?? [],
    license: repo.license?.spdx_id ?? repo.license?.name ?? null,
    url: repo.html_url,
    homepageUrl: repo.homepage || null,
    featured: false,
    category: language ?? 'Uncategorized',
    status: repo.archived ? 'archived' : 'active',
    maintainers: [],
    contribution: [],
    contributionSignals,
    techStack: [],
    relatedRepos: []
  };
}

function buildCategories(projects: AtlasProject[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();

  for (const project of projects) {
    const name = project.category || 'Uncategorized';
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeContributionSignals(topics: string[]): string[] {
  return topics
    .map((topic) => topic.trim().toLowerCase())
    .filter((topic) => CONTRIBUTION_TOPICS.has(topic))
    .map((topic) => topic.replace(/-/g, ' '));
}

function signalToTopic(signal: string): string {
  return signal.trim().toLowerCase().replace(/\s+/g, '-');
}
