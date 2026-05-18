export type StoryStatus = 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED';
export type ChapterStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ContentFormat = 'PLAIN_TEXT' | 'RICH_TEXT_HTML';

export type ContributorRole = 'OWNER' | 'CO_AUTHOR' | 'EDITOR';

export type ContentType =
  | 'STORY_WITH_CHAPTERS'
  | 'SHORT_STORY'
  | 'ARTICLE'
  | 'POEM';

export type StoryContributor = {
  userId: string;
  role: ContributorRole;
  penName?: string | null;
  addedAt?: string;
};

export type StorySummary = {
  id: string;
  title: string;
  synopsis?: string | null;
  status: StoryStatus;
  contentType: ContentType;    // NEW: required, server always returns one
  byline?: string | null;
  contributors?: StoryContributor[];
};

export type ChapterSummary = {
  id: string;
  title: string;
  chapterNumber: number;
  status: ChapterStatus;
};

export type Chapter = {
  id: string;
  storyId: string;
  title: string;
  content: string;
  contentFormat: ContentFormat;
  chapterNumber: number;
  status: ChapterStatus;
};

export type ContentStats = {
  total: number
  last24Hours: number
  last7Days: number
  last30Days: number
};