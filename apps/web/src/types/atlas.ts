export type ProjectStatus = 'active' | 'maintenance' | 'archived';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AtlasProject {
  name: string;
  fullName: string;
  description: string | null;
  pitch: string;
  stars: number;
  forks: number;
  language: string | null;
  archived: boolean;
  updatedAt: string;
  pushedAt: string | null;
  topics: string[];
  license: string | null;
  url: string;
  homepageUrl?: string | null;
  featured: boolean;
  category: string;
  status: ProjectStatus;
  maintainers: string[];
  contribution: string[];
  contributionSignals: string[];
  difficulty?: Difficulty;
  techStack: string[];
  relatedRepos: string[];
}

export interface Atlas {
  generatedAt: string;
  organization: {
    name: string;
    description?: string;
    url?: string;
  };
  stats: {
    totalRepos: number;
    featuredRepos: number;
    activeRepos: number;
    contributionReadyRepos: number;
    archivedRepos: number;
  };
  warnings: string[];
  projects: AtlasProject[];
  categories: Array<{
    name: string;
    count: number;
  }>;
}
