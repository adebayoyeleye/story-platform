export type StoryStatus = 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED';
export type ChapterStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type ContributorRole = 'OWNER' | 'CO_AUTHOR' | 'EDITOR';

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
  chapterNumber: number;
  status: ChapterStatus;
};
