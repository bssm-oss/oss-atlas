export type Locale = 'en' | 'ko';

export interface Dictionary {
  localeLabel: string;
  languageEnglish: string;
  languageKorean: string;
  brandKicker: string;
  updatedPrefix: string;
  home: {
    titleSuffix: string;
    heroKicker: string;
    fallbackDescription: string;
    visitOrganizationProfile: string;
    statsTitle: string;
    statsNote: string;
    statTotalRepositories: string;
    statFeaturedRepositories: string;
    statActiveRepositories: string;
    statContributionReady: string;
    statArchivedRepositories: string;
    featuredTitle: string;
    featuredNote: string;
    featuredEmpty: string;
    activityTitle: string;
    activityNote: string;
    activeNowTitle: string;
    activeEmpty: string;
    recentlyUpdatedTitle: string;
    recentEmpty: string;
    noLanguage: string;
    categoriesTitle: string;
    categoriesNote: string;
    repositoriesCount: string;
    contributionTagsTitle: string;
    contributionTagsNote: string;
    contributionTagsEmpty: string;
  };
  live: {
    title: string;
    subtitle: string;
    description: string;
    orgLabel: string;
    orgPlaceholder: string;
    submitLabel: string;
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
    resultTitle: string;
    resultCount: string;
    statRepositories: string;
    statStars: string;
    statForks: string;
    statLanguage: string;
    statArchived: string;
    statUpdated: string;
    repoCardStars: string;
    repoCardForks: string;
    repoCardLanguage: string;
    repoCardUpdated: string;
    repoCardLicense: string;
    repoCardTopics: string;
    repoCardOpen: string;
    repoCardArchived: string;
    errorTitle: string;
    errorGeneric: string;
    errorNotFound: string;
    errorRateLimit: string;
    limitationNote: string;
    limitationPublicOnly: string;
    limitationRateLimit: string;
    limitationNoSavedCuration: string;
  };
  project: {
    titleSuffix: string;
    backToOverview: string;
    detailSubtitle: string;
    metadataAriaLabel: string;
    metadataTitle: string;
    metaRepository: string;
    metaStars: string;
    metaForks: string;
    metaLicense: string;
    metaLastPush: string;
    notDeclared: string;
    repositoryLink: string;
    homepageLink: string;
    contributionAtlasTitle: string;
    contributionAtlasNote: string;
    maintainersTitle: string;
    maintainersEmpty: string;
    contributionTagsTitle: string;
    contributionTagsEmpty: string;
    contributionSignalsTitle: string;
    contributionSignalsEmpty: string;
    taxonomyTitle: string;
    taxonomyNote: string;
    topicsTitle: string;
    topicsEmpty: string;
    techStackTitle: string;
    techStackEmpty: string;
    relatedTitle: string;
    relatedNote: string;
    relatedEmpty: string;
  };
  card: {
    stars: string;
    forks: string;
    updatedPrefix: string;
  };
  unknownDate: string;
}

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    localeLabel: 'Language',
    languageEnglish: 'English',
    languageKorean: '한국어',
    brandKicker: 'Open Source Atlas',
    updatedPrefix: 'Updated',
    home: {
      titleSuffix: 'Open Source Atlas',
      heroKicker: 'Organization Overview',
      fallbackDescription: 'A generated atlas of repositories, contribution pathways, and project health.',
      visitOrganizationProfile: 'Visit organization profile',
      statsTitle: 'Atlas Statistics',
      statsNote: 'Repository signals at a glance',
      statTotalRepositories: 'Total Repositories',
      statFeaturedRepositories: 'Featured Repositories',
      statActiveRepositories: 'Active Repositories',
      statContributionReady: 'Contribution Ready',
      statArchivedRepositories: 'Archived Repositories',
      featuredTitle: 'Featured Projects',
      featuredNote: 'High-impact repositories in the organization atlas',
      featuredEmpty: 'No featured projects yet.',
      activityTitle: 'Active and Recent Projects',
      activityNote: 'Live activity and latest delivery cadence',
      activeNowTitle: 'Currently Active',
      activeEmpty: 'No active projects listed.',
      recentlyUpdatedTitle: 'Recently Updated',
      recentEmpty: 'No recent update data available.',
      noLanguage: 'n/a',
      categoriesTitle: 'Repository Categories',
      categoriesNote: 'Grouped by domain and responsibility',
      repositoriesCount: 'repositories',
      contributionTagsTitle: 'Contribution Tags',
      contributionTagsNote: 'Common contributor entry points across projects',
      contributionTagsEmpty: 'No contribution tags available.'
    },
    live: {
      title: 'Live Organization Explorer',
      subtitle: 'Map any public GitHub organization',
      description: 'Enter an organization name to browse its public repositories live.',
      orgLabel: 'GitHub organization',
      orgPlaceholder: 'e.g. vercel',
      submitLabel: 'Explore',
      loading: 'Loading public repositories…',
      emptyTitle: 'No organization loaded yet',
      emptyDescription: 'Search a public GitHub organization to see its repositories here.',
      resultTitle: 'Live results',
      resultCount: 'repositories found',
      statRepositories: 'Repositories',
      statStars: 'Stars',
      statForks: 'Forks',
      statLanguage: 'Primary language',
      statArchived: 'Archived',
      statUpdated: 'Recently updated',
      repoCardStars: 'stars',
      repoCardForks: 'forks',
      repoCardLanguage: 'language',
      repoCardUpdated: 'updated',
      repoCardLicense: 'license',
      repoCardTopics: 'topics',
      repoCardOpen: 'Open repository',
      repoCardArchived: 'Archived',
      errorTitle: 'Could not load repositories',
      errorGeneric: 'Something went wrong while fetching GitHub data.',
      errorNotFound: 'That organization was not found.',
      errorRateLimit: 'GitHub rate limit reached. Try again later.',
      limitationNote: 'Limitations',
      limitationPublicOnly: 'Public repositories only.',
      limitationRateLimit: 'GitHub API rate limits still apply.',
      limitationNoSavedCuration: 'This MVP does not save curation or manual edits.'
    },
    project: {
      titleSuffix: 'Atlas',
      backToOverview: 'Back to atlas overview',
      detailSubtitle: 'Project Detail',
      metadataAriaLabel: 'project metadata and contribution details',
      metadataTitle: 'Project Metadata',
      metaRepository: 'Repository',
      metaStars: 'Stars',
      metaForks: 'Forks',
      metaLicense: 'License',
      metaLastPush: 'Last push',
      notDeclared: 'Not declared',
      repositoryLink: 'Repository',
      homepageLink: 'Homepage',
      contributionAtlasTitle: 'Contribution Atlas',
      contributionAtlasNote: 'Maintainers and contributor entry points',
      maintainersTitle: 'Maintainers',
      maintainersEmpty: 'No maintainers listed.',
      contributionTagsTitle: 'Contribution Tags',
      contributionTagsEmpty: 'No contribution tags listed.',
      contributionSignalsTitle: 'Contribution Signals',
      contributionSignalsEmpty: 'No contribution signals listed.',
      taxonomyTitle: 'Taxonomy',
      taxonomyNote: 'Topics and stack references',
      topicsTitle: 'Topics',
      topicsEmpty: 'No topics detected.',
      techStackTitle: 'Tech Stack',
      techStackEmpty: 'No stack metadata detected.',
      relatedTitle: 'Related Repositories',
      relatedNote: 'Known links in the organization graph',
      relatedEmpty: 'No related repositories were declared.'
    },
    card: {
      stars: 'stars',
      forks: 'forks',
      updatedPrefix: 'Updated'
    },
    unknownDate: 'Unknown'
  },
  ko: {
    localeLabel: '언어',
    languageEnglish: 'English',
    languageKorean: '한국어',
    brandKicker: '오픈소스 아틀라스',
    updatedPrefix: '업데이트',
    home: {
      titleSuffix: '오픈소스 아틀라스',
      heroKicker: '조직 개요',
      fallbackDescription: '저장소, 기여 경로, 프로젝트 상태를 한눈에 보여주는 생성형 아틀라스입니다.',
      visitOrganizationProfile: '조직 프로필 보기',
      statsTitle: '아틀라스 통계',
      statsNote: '저장소 신호를 한눈에 확인하세요',
      statTotalRepositories: '전체 저장소',
      statFeaturedRepositories: '추천 저장소',
      statActiveRepositories: '활성 저장소',
      statContributionReady: '기여 가능 저장소',
      statArchivedRepositories: '보관 저장소',
      featuredTitle: '추천 프로젝트',
      featuredNote: '조직 아틀라스에서 영향력이 큰 저장소',
      featuredEmpty: '아직 추천 프로젝트가 없습니다.',
      activityTitle: '활성 및 최근 프로젝트',
      activityNote: '실시간 활동과 최신 업데이트 흐름',
      activeNowTitle: '현재 활성',
      activeEmpty: '표시할 활성 프로젝트가 없습니다.',
      recentlyUpdatedTitle: '최근 업데이트',
      recentEmpty: '최근 업데이트 데이터가 없습니다.',
      noLanguage: '없음',
      categoriesTitle: '저장소 카테고리',
      categoriesNote: '도메인과 역할 기준으로 분류',
      repositoriesCount: '개 저장소',
      contributionTagsTitle: '기여 태그',
      contributionTagsNote: '프로젝트 전반에서 자주 보이는 기여 시작점',
      contributionTagsEmpty: '기여 태그가 없습니다.'
    },
    live: {
      title: '실시간 조직 탐색기',
      subtitle: '공개 GitHub 조직을 바로 살펴보기',
      description: '조직 이름을 입력하면 공개 저장소를 실시간으로 확인할 수 있습니다.',
      orgLabel: 'GitHub 조직',
      orgPlaceholder: '예: vercel',
      submitLabel: '탐색',
      loading: '공개 저장소를 불러오는 중…',
      emptyTitle: '아직 조직이 선택되지 않았습니다',
      emptyDescription: '공개 GitHub 조직을 검색하면 저장소 목록이 여기에 표시됩니다.',
      resultTitle: '실시간 결과',
      resultCount: '개 저장소 발견',
      statRepositories: '저장소',
      statStars: '스타',
      statForks: '포크',
      statLanguage: '주요 언어',
      statArchived: '보관됨',
      statUpdated: '최근 업데이트',
      repoCardStars: '스타',
      repoCardForks: '포크',
      repoCardLanguage: '언어',
      repoCardUpdated: '업데이트',
      repoCardLicense: '라이선스',
      repoCardTopics: '토픽',
      repoCardOpen: '저장소 열기',
      repoCardArchived: '보관됨',
      errorTitle: '저장소를 불러오지 못했습니다',
      errorGeneric: 'GitHub 데이터를 가져오는 중 문제가 생겼습니다.',
      errorNotFound: '해당 조직을 찾을 수 없습니다.',
      errorRateLimit: 'GitHub 요청 제한에 도달했습니다. 잠시 후 다시 시도하세요.',
      limitationNote: '제한 사항',
      limitationPublicOnly: '공개 저장소만 표시합니다.',
      limitationRateLimit: 'GitHub API 요청 제한이 적용됩니다.',
      limitationNoSavedCuration: '이 MVP는 별도 큐레이션이나 수동 수정 내용을 저장하지 않습니다.'
    },
    project: {
      titleSuffix: '아틀라스',
      backToOverview: '아틀라스 개요로 돌아가기',
      detailSubtitle: '프로젝트 상세',
      metadataAriaLabel: '프로젝트 메타데이터 및 기여 정보',
      metadataTitle: '프로젝트 메타데이터',
      metaRepository: '저장소',
      metaStars: '스타',
      metaForks: '포크',
      metaLicense: '라이선스',
      metaLastPush: '마지막 푸시',
      notDeclared: '미기재',
      repositoryLink: '저장소',
      homepageLink: '홈페이지',
      contributionAtlasTitle: '기여 아틀라스',
      contributionAtlasNote: '메인테이너와 기여 시작 지점',
      maintainersTitle: '메인테이너',
      maintainersEmpty: '등록된 메인테이너가 없습니다.',
      contributionTagsTitle: '기여 태그',
      contributionTagsEmpty: '등록된 기여 태그가 없습니다.',
      contributionSignalsTitle: '기여 신호',
      contributionSignalsEmpty: '등록된 기여 신호가 없습니다.',
      taxonomyTitle: '분류',
      taxonomyNote: '토픽과 기술 스택 참고',
      topicsTitle: '토픽',
      topicsEmpty: '감지된 토픽이 없습니다.',
      techStackTitle: '기술 스택',
      techStackEmpty: '기술 스택 메타데이터가 없습니다.',
      relatedTitle: '연관 저장소',
      relatedNote: '조직 그래프에서 확인된 연결',
      relatedEmpty: '선언된 연관 저장소가 없습니다.'
    },
    card: {
      stars: '스타',
      forks: '포크',
      updatedPrefix: '업데이트'
    },
    unknownDate: '알 수 없음'
  }
};

export const normalizeBaseUrl = (rawBaseUrl: string): string =>
  rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

export const homePath = (locale: Locale, rawBaseUrl: string): string => {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);
  return locale === 'ko' ? `${baseUrl}ko/` : baseUrl;
};

export const projectPath = (locale: Locale, name: string, rawBaseUrl: string): string => {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);
  return locale === 'ko' ? `${baseUrl}ko/projects/${name}/` : `${baseUrl}projects/${name}/`;
};

export const formatDateByLocale = (value: string | null, locale: Locale): string => {
  if (!value) {
    return dictionaries[locale].unknownDate;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return dictionaries[locale].unknownDate;
  }

  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(parsed);
};
