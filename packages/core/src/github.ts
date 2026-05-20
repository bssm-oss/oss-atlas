import { githubCacheSchema, type GitHubCache, type GitHubRepo } from './schema.js';

interface GitHubApiRepo {
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
}

export interface FetchGitHubOrgOptions {
  org: string;
  token?: string;
  fetchImpl?: typeof fetch;
}

export async function fetchGitHubOrg(options: FetchGitHubOrgOptions): Promise<GitHubCache> {
  const fetcher = options.fetchImpl ?? fetch;
  const repos: GitHubRepo[] = [];
  let page = 1;

  while (true) {
    const url = new URL(`https://api.github.com/orgs/${options.org}/repos`);
    url.searchParams.set('type', 'public');
    url.searchParams.set('sort', 'updated');
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));

    const response = await fetcher(url, {
      headers: githubHeaders(options.token)
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`GitHub request failed (${response.status}): ${message}`);
    }

    const data = await response.json() as GitHubApiRepo[];
    repos.push(...data.map(normalizeRepo));

    if (data.length < 100) {
      break;
    }

    page += 1;
  }

  return githubCacheSchema.parse({
    organization: options.org,
    fetchedAt: new Date().toISOString(),
    repos
  });
}

function githubHeaders(token?: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function normalizeRepo(repo: GitHubApiRepo): GitHubRepo {
  return {
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
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
