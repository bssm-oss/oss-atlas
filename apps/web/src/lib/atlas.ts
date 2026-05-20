import atlasData from '../generated/atlas.json';
import type { Atlas, AtlasProject } from '../types/atlas';

export const atlas: Atlas = atlasData as Atlas;

const toTimestamp = (date: string | null): number => {
  if (!date) {
    return 0;
  }

  const parsed = Date.parse(date);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const compareByRecentUpdate = (a: AtlasProject, b: AtlasProject): number => {
  const aTime = Math.max(toTimestamp(a.pushedAt), toTimestamp(a.updatedAt));
  const bTime = Math.max(toTimestamp(b.pushedAt), toTimestamp(b.updatedAt));
  return bTime - aTime;
};

export const featuredProjects = atlas.projects
  .filter((project) => project.featured)
  .sort(compareByRecentUpdate);

export const activeProjects = atlas.projects
  .filter((project) => project.status === 'active' && !project.archived)
  .sort(compareByRecentUpdate);

export const recentProjects = [...atlas.projects]
  .sort(compareByRecentUpdate)
  .slice(0, 6);

export const projectByName = new Map(atlas.projects.map((project) => [project.name, project]));

export const projectsByCategory = atlas.categories.map((category) => {
  const projects = atlas.projects
    .filter((project) => project.category === category.name)
    .sort(compareByRecentUpdate);

  return {
    ...category,
    projects
  };
});

export const contributionTags = Array.from(
  atlas.projects.reduce((accumulator, project) => {
    const mergedTags = [...project.contribution, ...project.contributionSignals];

    for (const tag of mergedTags) {
      const normalized = tag.trim();
      if (!normalized) {
        continue;
      }

      accumulator.set(normalized, (accumulator.get(normalized) ?? 0) + 1);
    }

    return accumulator;
  }, new Map<string, number>())
)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

export const formatDate = (value: string | null): string => {
  if (!value) {
    return 'Unknown';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(parsed);
};
