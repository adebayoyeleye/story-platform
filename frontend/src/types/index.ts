export type StoryStatus = 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'PUBLISHED' | 'ARCHIVED';
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

// Optional fields — server may not yet populate. UI handles undefined
// gracefully via placeholders.
export type StorySummary = {
  id: string;
  title: string;
  synopsis?: string | null;
  status: StoryStatus;
  contentType: ContentType;
  byline?: string | null;
  contributors?: StoryContributor[];

  // NEW: optional for now
  coverImageUrl?: string | null;     // null/undefined → CoverImage placeholder
  wordCount?: number | null;         // null/undefined → don't display read-time
  chapterCount?: number | null;      // null/undefined → don't display chapter count
  teaser?: string | null;            // for poems: first ~4 lines, server-rendered later
  updatedAt?: string | null;         // ISO string; for "Updated 3 days ago"
  deck?: string | null;  // article subtitle ("dek" in journalism). Article cards
                         // prefer this over synopsis for the preview line.
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