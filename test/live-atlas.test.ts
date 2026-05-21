import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AtlasProject } from '../apps/web/src/types/atlas.ts';
import {
  buildContributionTags,
  buildLiveAtlas,
  fetchGitHubOrganizationRepos,
  normalizeOrganizationInput
} from '../apps/web/src/lib/live-atlas.ts';

describe('normalizeOrganizationInput', () => {
  it('trims and lowercases a valid GitHub organization name', () => {
    expect(normalizeOrganizationInput('  BSSM-OSS  ')).toBe('bssm-oss');
  });

  it('rejects invalid organization input with a friendly error', () => {
    expect(() => normalizeOrganizationInput('')).toThrow('Enter a valid GitHub organization name.');
    expect(() => normalizeOrganizationInput('   ')).toThrow('Enter a valid GitHub organization name.');
    expect(() => normalizeOrganizationInput('not a/org')).toThrow('Enter a valid GitHub organization name.');
  });
});

describe('fetchGitHubOrganizationRepos', () => {
  it('pages through public GitHub repos using mocked fetch', async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
      const url = input instanceof URL ? input : new URL(String(input));
      requests.push({ url: url.toString(), init });

      if (url.searchParams.get('page') === '1') {
        return new Response(JSON.stringify([
          githubApiRepo('alpha', {
            description: 'First repo',
            stargazers_count: 7,
            forks_count: 2,
            language: 'TypeScript',
            topics: ['good-first-issue', 'frontend'],
            license: { spdx_id: 'MIT', name: 'MIT License' },
            homepage: 'https://alpha.example'
          }),
          githubApiRepo('beta', {
            description: null,
            stargazers_count: 3,
            forks_count: 0,
            language: 'Python',
            topics: [],
            license: { spdx_id: 'NOASSERTION', name: 'Custom License' },
            homepage: ''
          })
        ]), { status: 200 });
      }

      return new Response(JSON.stringify([
        githubApiRepo('final', {
          description: 'Last repo',
          stargazers_count: 1,
          forks_count: 0,
          language: null,
          archived: true,
          topics: ['help-wanted'],
          license: null,
          homepage: null
        })
      ]), { status: 200 });
    });

    const repos = await fetchGitHubOrganizationRepos({ org: 'bssm-oss', fetchImpl });

    expect(requests).toHaveLength(2);
    expect(requests[0]?.url).toContain('https://api.github.com/orgs/bssm-oss/repos');
    expect(requests[0]?.url).toContain('page=1');
    expect(requests[1]?.url).toContain('page=2');
    expect(new Headers(requests[0]?.init?.headers).get('Authorization')).toBeNull();

    expect(repos).toEqual([
      {
        name: 'alpha',
        fullName: 'bssm-oss/alpha',
        description: 'First repo',
        stars: 7,
        forks: 2,
        language: 'TypeScript',
        archived: false,
        updatedAt: '2026-05-22T00:00:00.000Z',
        pushedAt: '2026-05-22T00:00:00.000Z',
        topics: ['good-first-issue', 'frontend'],
        license: 'MIT',
        url: 'https://github.com/bssm-oss/alpha',
        homepageUrl: 'https://alpha.example'
      },
      {
        name: 'beta',
        fullName: 'bssm-oss/beta',
        description: null,
        stars: 3,
        forks: 0,
        language: 'Python',
        archived: false,
        updatedAt: '2026-05-22T00:00:00.000Z',
        pushedAt: '2026-05-22T00:00:00.000Z',
        topics: [],
        license: 'Custom License',
        url: 'https://github.com/bssm-oss/beta',
        homepageUrl: null
      },
      {
        name: 'final',
        fullName: 'bssm-oss/final',
        description: 'Last repo',
        stars: 1,
        forks: 0,
        language: null,
        archived: true,
        updatedAt: '2026-05-22T00:00:00.000Z',
        pushedAt: '2026-05-22T00:00:00.000Z',
        topics: ['help-wanted'],
        license: null,
        url: 'https://github.com/bssm-oss/final',
        homepageUrl: null
      }
    ]);
  });

  it('throws a friendly error when GitHub returns 404 or 403 rate limit responses', async () => {
    const notFoundFetch: typeof fetch = vi.fn(async () => new Response('not found', { status: 404 }));
    await expect(fetchGitHubOrganizationRepos({ org: 'missing-org', fetchImpl: notFoundFetch }))
      .rejects.toThrow('GitHub organization "missing-org" was not found.');

    const rateLimitedFetch: typeof fetch = vi.fn(async () => new Response('rate limited', { status: 403 }));
    await expect(fetchGitHubOrganizationRepos({ org: 'bssm-oss', fetchImpl: rateLimitedFetch }))
      .rejects.toThrow('GitHub rate limit exceeded. Try again later.');
  });
});

describe('buildLiveAtlas', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-22T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps GitHub repos into atlas projects and derives stats and categories', () => {
    const atlas = buildLiveAtlas('  BSSM-OSS  ', [
      githubRepo('maru', {
        description: 'Student project',
        stargazers_count: 42,
        forks_count: 7,
        language: 'TypeScript',
        archived: false,
        updated_at: '2026-05-21T12:00:00.000Z',
        pushed_at: '2026-05-21T12:00:00.000Z',
        topics: ['good-first-issue', 'help-wanted', 'frontend'],
        license: { spdx_id: 'MIT', name: 'MIT License' },
        html_url: 'https://github.com/BSSM-OSS/maru',
        homepage: 'https://maru.example'
      }),
      githubRepo('old-lab', {
        description: null,
        stargazers_count: 1,
        forks_count: 0,
        language: 'Python',
        archived: true,
        updated_at: '2020-01-01T00:00:00.000Z',
        pushed_at: null,
        topics: ['needs-maintainer'],
        license: null,
        html_url: 'https://github.com/BSSM-OSS/old-lab',
        homepage: ''
      })
    ]);

    expect(atlas).toMatchObject({
      generatedAt: '2026-05-22T00:00:00.000Z',
      organization: {
        name: 'bssm-oss',
        url: 'https://github.com/bssm-oss'
      },
      stats: {
        totalRepos: 2,
        featuredRepos: 0,
        activeRepos: 1,
        contributionReadyRepos: 2,
        archivedRepos: 1
      },
      warnings: [],
      categories: [
        { name: 'Python', count: 1 },
        { name: 'TypeScript', count: 1 }
      ]
    });

    expect(atlas.projects[0]).toMatchObject({
      name: 'maru',
      fullName: 'BSSM-OSS/maru',
      pitch: 'Student project',
      featured: false,
      category: 'TypeScript',
      status: 'active',
      maintainers: [],
      contribution: [],
      contributionSignals: ['good first issue', 'help wanted'],
      techStack: [],
      relatedRepos: []
    });

    expect(atlas.projects[1]).toMatchObject({
      name: 'old-lab',
      pitch: 'No project pitch yet.',
      archived: true,
      category: 'Python',
      status: 'archived',
      contributionSignals: ['needs maintainer']
    });
  });

  it('derives contribution tags from project contribution signals', () => {
    const atlas = buildLiveAtlas('bssm-oss', [
      githubRepo('alpha', {
        description: 'Alpha',
        stargazers_count: 1,
        forks_count: 0,
        language: 'TypeScript',
        archived: false,
        updated_at: '2026-05-21T12:00:00.000Z',
        pushed_at: '2026-05-21T12:00:00.000Z',
        topics: ['good-first-issue', 'frontend'],
        license: null,
        html_url: 'https://github.com/bssm-oss/alpha',
        homepage: null
      }),
      githubRepo('beta', {
        description: 'Beta',
        stargazers_count: 1,
        forks_count: 0,
        language: 'TypeScript',
        archived: false,
        updated_at: '2026-05-21T12:00:00.000Z',
        pushed_at: '2026-05-21T12:00:00.000Z',
        topics: ['help-wanted', 'good-first-issue'],
        license: null,
        html_url: 'https://github.com/bssm-oss/beta',
        homepage: null
      })
    ]);

    expect(buildContributionTags(atlas.projects)).toEqual([
      { name: 'good first issue', count: 2 },
      { name: 'help wanted', count: 1 }
    ]);
  });
});

function githubApiRepo(
  name: string,
  overrides: Partial<{
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    archived: boolean;
    updated_at: string;
    pushed_at: string | null;
    topics: string[];
    license: { spdx_id?: string | null; name?: string | null } | null;
    html_url: string;
    homepage: string | null;
  }> = {}
) {
  return {
    name,
    full_name: `bssm-oss/${name}`,
    description: overrides.description !== undefined ? overrides.description : `Description for ${name}`,
    stargazers_count: overrides.stargazers_count ?? 1,
    forks_count: overrides.forks_count ?? 0,
    language: overrides.language !== undefined ? overrides.language : 'TypeScript',
    archived: overrides.archived ?? false,
    updated_at: overrides.updated_at ?? '2026-05-22T00:00:00.000Z',
    pushed_at: overrides.pushed_at ?? '2026-05-22T00:00:00.000Z',
    topics: overrides.topics ?? [],
    license: overrides.license !== undefined ? overrides.license : { spdx_id: 'MIT', name: 'MIT License' },
    html_url: overrides.html_url ?? `https://github.com/bssm-oss/${name}`,
    homepage: overrides.homepage !== undefined ? overrides.homepage : null
  };
}

function githubRepo(name: string, overrides: Partial<AtlasProject> & {
  description?: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  archived: boolean;
  updated_at: string;
  pushed_at: string | null;
  topics: string[];
  license: { spdx_id?: string | null; name?: string | null } | null;
  html_url: string;
  homepage: string | null;
}) {
  return {
    name,
    full_name: `BSSM-OSS/${name}`,
    description: overrides.description !== undefined ? overrides.description : `Description for ${name}`,
    stargazers_count: overrides.stargazers_count,
    forks_count: overrides.forks_count,
    language: overrides.language,
    archived: overrides.archived,
    updated_at: overrides.updated_at,
    pushed_at: overrides.pushed_at,
    topics: overrides.topics,
    license: overrides.license,
    html_url: overrides.html_url,
    homepage: overrides.homepage
  };
}
