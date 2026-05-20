import { z } from 'zod';

export const statusSchema = z.enum(['active', 'maintenance', 'archived']);
export const difficultySchema = z.enum(['easy', 'medium', 'hard']);

export const catalogEntrySchema = z.object({
  featured: z.boolean().optional(),
  category: z.string().min(1).optional(),
  status: statusSchema.optional(),
  pitch: z.string().min(1).optional(),
  maintainers: z.array(z.string().min(1)).default([]),
  contribution: z.array(z.string().min(1)).default([]),
  difficulty: difficultySchema.optional(),
  techStack: z.array(z.string().min(1)).default([]),
  relatedRepos: z.array(z.string().min(1)).default([])
});

export const catalogSchema = z.object({
  organization: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    url: z.string().url().optional()
  }),
  repos: z.record(z.string().min(1), catalogEntrySchema).default({})
});

export const githubRepoSchema = z.object({
  name: z.string(),
  fullName: z.string(),
  description: z.string().nullable(),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  language: z.string().nullable(),
  archived: z.boolean(),
  updatedAt: z.string(),
  pushedAt: z.string().nullable(),
  topics: z.array(z.string()),
  license: z.string().nullable(),
  url: z.string().url(),
  homepageUrl: z.string().url().nullable().optional()
});

export const githubCacheSchema = z.object({
  organization: z.string(),
  fetchedAt: z.string(),
  repos: z.array(githubRepoSchema)
});

export const atlasProjectSchema = z.object({
  name: z.string(),
  fullName: z.string(),
  description: z.string().nullable(),
  pitch: z.string(),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  language: z.string().nullable(),
  archived: z.boolean(),
  updatedAt: z.string(),
  pushedAt: z.string().nullable(),
  topics: z.array(z.string()),
  license: z.string().nullable(),
  url: z.string().url(),
  homepageUrl: z.string().url().nullable().optional(),
  featured: z.boolean(),
  category: z.string(),
  status: statusSchema,
  maintainers: z.array(z.string()),
  contribution: z.array(z.string()),
  contributionSignals: z.array(z.string()),
  difficulty: difficultySchema.optional(),
  techStack: z.array(z.string()),
  relatedRepos: z.array(z.string())
});

export const atlasSchema = z.object({
  generatedAt: z.string(),
  organization: z.object({
    name: z.string(),
    description: z.string().optional(),
    url: z.string().url().optional()
  }),
  stats: z.object({
    totalRepos: z.number().int().nonnegative(),
    featuredRepos: z.number().int().nonnegative(),
    activeRepos: z.number().int().nonnegative(),
    contributionReadyRepos: z.number().int().nonnegative(),
    archivedRepos: z.number().int().nonnegative()
  }),
  warnings: z.array(z.string()),
  projects: z.array(atlasProjectSchema),
  categories: z.array(z.object({
    name: z.string(),
    count: z.number().int().nonnegative()
  }))
});

export type CatalogEntry = z.infer<typeof catalogEntrySchema>;
export type Catalog = z.infer<typeof catalogSchema>;
export type GitHubRepo = z.infer<typeof githubRepoSchema>;
export type GitHubCache = z.infer<typeof githubCacheSchema>;
export type AtlasProject = z.infer<typeof atlasProjectSchema>;
export type Atlas = z.infer<typeof atlasSchema>;
