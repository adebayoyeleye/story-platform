package com.storyplatform.contentservice.domain;

/**
 * Discriminates the four kinds of works the platform hosts.
 *
 *   STORY_WITH_CHAPTERS — serialized fiction, multi-chapter (e.g., novels, web serials).
 *                         Has a real Chapter list visible to readers and writers.
 *
 *   SHORT_STORY         — single-flow prose fiction. One synthetic Chapter under the
 *                         hood, never paginated, never shown as a chapter list.
 *
 *   ARTICLE             — single-flow non-fiction (essays, opinion, reportage).
 *                         Same one-synthetic-chapter shape as SHORT_STORY.
 *
 *   POEM                — single-flow verse. Preserves whitespace at render time;
 *                         line-count replaces word-count in UI.
 *
 * Persisted as the enum name (String). Default at the read boundary is
 * STORY_WITH_CHAPTERS so pre-existing documents (which have no contentType
 * field) load as the original chapter-centric model.
 */
public enum ContentType {
    STORY_WITH_CHAPTERS,
    SHORT_STORY,
    ARTICLE,
    POEM
}