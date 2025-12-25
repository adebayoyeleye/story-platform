export type StorySummary = {
  id: string;
  title: string;
  authorId: string;
  synopsis: string;
  status: 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED';
};

export type ChapterSummary = {
  id: string;
  title: string;
  chapterNumber: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
};

export type Chapter = {
  id: string;
  storyId: string;
  title: string;
  content: string;
  chapterNumber: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
};
