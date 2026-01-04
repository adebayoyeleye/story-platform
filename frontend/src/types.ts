export type StoryStatus = 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED';
export type ChapterStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type StorySummary = {
  id: string;
  title: string;
  authorId: string;
  synopsis?: string | null;
  status: StoryStatus;
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
