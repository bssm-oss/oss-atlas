import type { Atlas, AtlasProject } from '../types/atlas';
import type { Dictionary } from './i18n';
import {
  buildContributionTags,
  buildLiveAtlas,
  fetchGitHubOrganizationRepos,
  normalizeOrganizationInput,
  type LiveAtlasRepo
} from './live-atlas';

type LiveCopy = Dictionary['live'];
type LocaleName = 'en' | 'ko';
type StatusVariant = 'empty' | 'error';

const formatNumber = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(value);

const formatDate = (value: string | null, locale: string): string => {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(parsed);
};

const escapeHtml = (value: unknown): string =>
  String(value).replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  })[char] ?? char);

const parseCopy = (root: HTMLElement): LiveCopy => JSON.parse(root.dataset.liveCopy ?? '{}') as LiveCopy;

const getLocale = (root: HTMLElement): LocaleName => (root.dataset.liveLang === 'ko' ? 'ko' : 'en');

const renderStatus = (root: HTMLElement, title: string, description: string, variant: StatusVariant = 'empty'): void => {
  const status = root.querySelector<HTMLElement>('[data-live-status]');
  const results = root.querySelector<HTMLElement>('[data-live-results]');
  if (!status || !results) {
    return;
  }

  results.hidden = true;
  results.innerHTML = '';
  status.innerHTML = `<div class="${variant === 'error' ? 'live-error' : 'empty-note'}"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></div>`;
};

const renderLoading = (root: HTMLElement, copy: LiveCopy): void => {
  const status = root.querySelector<HTMLElement>('[data-live-status]');
  const results = root.querySelector<HTMLElement>('[data-live-results]');
  if (!status || !results) {
    return;
  }

  results.hidden = true;
  results.innerHTML = '';
  status.innerHTML = `<div class="live-loading" role="status">${escapeHtml(copy.loading)}</div>`;
};

const renderStat = (label: string, value: number | string, locale: string): string => `
  <article class="stat-card">
    <p class="stat-label">${escapeHtml(label)}</p>
    <p class="stat-value">${typeof value === 'number' ? formatNumber(value, locale) : escapeHtml(value)}</p>
  </article>
`;

const renderProject = (project: AtlasProject, copy: LiveCopy, locale: string): string => `
  <article class="project-card live-project-card">
    <div class="project-top">
      <a class="project-name" href="${escapeHtml(project.url)}" target="_blank" rel="noreferrer">${escapeHtml(project.name)}</a>
      <span class="status-pill" data-status="${escapeHtml(project.status)}">${escapeHtml(project.archived ? copy.repoCardArchived : project.status)}</span>
    </div>
    <p class="project-pitch">${escapeHtml(project.pitch)}</p>
    <div class="project-meta">
      <span class="tag">${formatNumber(project.stars, locale)} ${escapeHtml(copy.repoCardStars)}</span>
      <span class="tag">${formatNumber(project.forks, locale)} ${escapeHtml(copy.repoCardForks)}</span>
      ${project.language ? `<span class="tag">${escapeHtml(project.language)}</span>` : ''}
      ${project.license ? `<span class="tag">${escapeHtml(copy.repoCardLicense)}: ${escapeHtml(project.license)}</span>` : ''}
      ${project.pushedAt ? `<span class="tag">${escapeHtml(copy.repoCardUpdated)} ${escapeHtml(formatDate(project.pushedAt, locale))}</span>` : ''}
    </div>
  </article>
`;

const renderAtlas = (root: HTMLElement, atlas: Atlas, copy: LiveCopy, locale: LocaleName): void => {
  const status = root.querySelector<HTMLElement>('[data-live-status]');
  const results = root.querySelector<HTMLElement>('[data-live-results]');
  if (!status || !results) {
    return;
  }

  const totalStars = atlas.projects.reduce((sum, project) => sum + project.stars, 0);
  const totalForks = atlas.projects.reduce((sum, project) => sum + project.forks, 0);
  const topLanguage = atlas.categories[0]?.name ?? 'n/a';
  const contributionTags = buildContributionTags(atlas.projects).slice(0, 8);

  status.innerHTML = '';
  results.hidden = false;
  results.innerHTML = `
    <div class="section-heading live-result-heading">
      <div>
        <h3 class="section-title">${escapeHtml(copy.resultTitle)}: ${escapeHtml(atlas.organization.name)}</h3>
        <p class="section-note">${formatNumber(atlas.projects.length, locale)} ${escapeHtml(copy.resultCount)}</p>
      </div>
      <a href="${escapeHtml(atlas.organization.url ?? '#')}" target="_blank" rel="noreferrer">GitHub</a>
    </div>
    <div class="stat-grid live-stat-grid">
      ${renderStat(copy.statRepositories, atlas.stats.totalRepos, locale)}
      ${renderStat(copy.statStars, totalStars, locale)}
      ${renderStat(copy.statForks, totalForks, locale)}
      ${renderStat(copy.statLanguage, topLanguage, locale)}
      ${renderStat(copy.statArchived, atlas.stats.archivedRepos, locale)}
      ${renderStat(copy.statUpdated, atlas.projects.filter((project) => project.status === 'active').length, locale)}
    </div>
    ${contributionTags.length > 0 ? `<div class="live-topic-row">${contributionTags.map((tag) => `<span class="tag">${escapeHtml(tag.name)} (${formatNumber(tag.count, locale)})</span>`).join('')}</div>` : ''}
    <div class="project-grid live-project-grid">
      ${atlas.projects.slice(0, 24).map((project) => renderProject(project, copy, locale)).join('')}
    </div>
  `;
};

const getFriendlyError = (error: unknown, copy: LiveCopy): string => {
  const message = error instanceof Error ? error.message : copy.errorGeneric;
  if (message.includes('valid GitHub organization')) {
    return message;
  }
  if (message.includes('not found')) {
    return copy.errorNotFound;
  }
  if (message.includes('rate limit')) {
    return copy.errorRateLimit;
  }
  return copy.errorGeneric;
};

const toGitHubRepoInput = (repo: LiveAtlasRepo) => ({
  name: repo.name,
  full_name: repo.fullName,
  description: repo.description,
  stargazers_count: repo.stars,
  forks_count: repo.forks,
  language: repo.language,
  archived: repo.archived,
  updated_at: repo.updatedAt,
  pushed_at: repo.pushedAt,
  topics: repo.topics,
  license: repo.license ? { spdx_id: repo.license, name: repo.license } : null,
  html_url: repo.url,
  homepage: repo.homepageUrl
});

const loadOrganization = async (root: HTMLElement, inputValue: string, replaceState = false): Promise<void> => {
  const copy = parseCopy(root);
  const locale = getLocale(root);
  const input = root.querySelector<HTMLInputElement>('[data-live-input]');
  const submit = root.querySelector<HTMLButtonElement>('[data-live-submit]');

  try {
    const org = normalizeOrganizationInput(inputValue);
    if (input) {
      input.value = org;
    }
    if (submit) {
      submit.disabled = true;
    }
    renderLoading(root, copy);

    const url = new URL(window.location.href);
    url.searchParams.set('org', org);
    window.history[replaceState ? 'replaceState' : 'pushState']({}, '', url);

    const repos = await fetchGitHubOrganizationRepos({ org });
    const atlas = buildLiveAtlas(org, repos.map(toGitHubRepoInput));

    if (atlas.projects.length === 0) {
      renderStatus(root, copy.emptyTitle, copy.emptyDescription);
      return;
    }

    renderAtlas(root, atlas, copy, locale);
  } catch (error) {
    renderStatus(root, copy.errorTitle, getFriendlyError(error, copy), 'error');
  } finally {
    if (submit) {
      submit.disabled = false;
    }
  }
};

const initializeLiveAtlas = (root: HTMLElement): void => {
  const copy = parseCopy(root);
  const form = root.querySelector<HTMLFormElement>('[data-live-form]');
  const input = root.querySelector<HTMLInputElement>('[data-live-input]');

  form?.addEventListener('submit', (event: SubmitEvent) => {
    event.preventDefault();
    void loadOrganization(root, input?.value ?? '');
  });

  const initialOrg = new URL(window.location.href).searchParams.get('org');
  if (initialOrg) {
    void loadOrganization(root, initialOrg, true);
  } else {
    renderStatus(root, copy.emptyTitle, copy.emptyDescription);
  }

  window.addEventListener('popstate', () => {
    const org = new URL(window.location.href).searchParams.get('org');
    if (org) {
      void loadOrganization(root, org, true);
      return;
    }

    if (input) {
      input.value = '';
    }
    renderStatus(root, copy.emptyTitle, copy.emptyDescription);
  });
};

document.querySelectorAll<HTMLElement>('[data-live-atlas]').forEach(initializeLiveAtlas);
