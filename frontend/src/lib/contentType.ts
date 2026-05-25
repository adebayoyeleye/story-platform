import type { ContentType, StoryStatus } from "@/types"

export type ContentTypeMeta = {
  type: ContentType
  label: string           // "Serialised story"
  shortLabel: string      // "Serial" — for badges
  description: string     // one-line for the chooser modal
  icon: string            // simple unicode; swap to lucide later
}

export const CONTENT_TYPE_META: Record<ContentType, ContentTypeMeta> = {
  STORY_WITH_CHAPTERS: {
    type: "STORY_WITH_CHAPTERS",
    label: "Serialised story",
    shortLabel: "Serial",
    description: "A multi-chapter work — novels, web serials, anything ongoing.",
    icon: "≡",
  },
  SHORT_STORY: {
    type: "SHORT_STORY",
    label: "Short story",
    shortLabel: "Short",
    description: "A single-sitting fiction piece. No chapters, one flow.",
    icon: "•",
  },
  ARTICLE: {
    type: "ARTICLE",
    label: "Article",
    shortLabel: "Article",
    description: "Non-fiction — essay, opinion, reportage, interview, review.",
    icon: "▤",
  },
  POEM: {
    type: "POEM",
    label: "Poem",
    shortLabel: "Poem",
    description: "Verse, with whitespace preserved. Line breaks honored.",
    icon: "❦",
  },
}

// Stable iteration order for menus. Don't rely on Object.values order
// across engines/major versions for user-facing lists.
export const CONTENT_TYPE_ORDER: ContentType[] = [
  "STORY_WITH_CHAPTERS",
  "SHORT_STORY",
  "ARTICLE",
  "POEM",
]

/**
 * Allowed lifecycle states per content type. MUST match
 * domain.ContentType.allowedStatuses() on the backend. Convergence is
 * tracked as P-RULES-API.
 *
 * Why this lives next to the icon/label metadata: any UI surface that
 * lets a user pick a status (writer editor) is the same surface that
 * shows the type's label. Co-locating the data keeps the import surface
 * small.
 */
export const ALLOWED_STATUSES: Record<ContentType, StoryStatus[]> = {
  STORY_WITH_CHAPTERS: ["DRAFT", "ONGOING", "COMPLETED", "ARCHIVED"],
  SHORT_STORY:         ["DRAFT", "PUBLISHED", "ARCHIVED"],
  ARTICLE:             ["DRAFT", "PUBLISHED", "ARCHIVED"],
  POEM:                ["DRAFT", "PUBLISHED", "ARCHIVED"],
}

/**
 * Human-readable status labels. Same status value can read differently
 * depending on context, but we keep it simple for now — one label per
 * status, used everywhere.
 */
export const STATUS_LABEL: Record<StoryStatus, string> = {
  DRAFT:     "Draft",
  ONGOING:   "Ongoing",
  COMPLETED: "Completed",
  PUBLISHED: "Published",
  ARCHIVED:  "Archived",
}

/**
 * URL slug ↔ ContentType. The slug is lowercased and dash-separated;
 * we never expose underscores in URLs (they look unloved).
 *
 *   STORY_WITH_CHAPTERS ↔ "serial"
 *   SHORT_STORY         ↔ "short"
 *   ARTICLE             ↔ "articles"
 *   POEM                ↔ "poems"
 *
 * Plural slugs because the URL refers to a category, not one item —
 * /discover/poems reads better than /discover/poem.
 */
const SLUG: Record<ContentType, string> = {
  STORY_WITH_CHAPTERS: "serial",
  SHORT_STORY:         "short",
  ARTICLE:             "articles",
  POEM:                "poems",
}

export function contentTypeToSlug(type: ContentType): string {
  return SLUG[type]
}

export function contentTypeFromSlug(slug: string): ContentType | null {
  for (const type of CONTENT_TYPE_ORDER) {
    if (SLUG[type] === slug) return type
  }
  return null
}