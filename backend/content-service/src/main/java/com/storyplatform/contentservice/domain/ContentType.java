package com.storyplatform.contentservice.domain;

import java.util.EnumSet;
import java.util.Set;

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
    POEM;

    /**
     * Which lifecycle states are valid for this content type.
     *
     * Serialised stories have a real lifecycle (DRAFT → ONGOING → COMPLETED).
     * Standalone works (short story, article, poem) are a binary —
     * a writer is either drafting or has published; there's no "ongoing
     * poem" because the work is complete by definition once a reader
     * sees it. ARCHIVED is universal (writer-initiated retirement).
     *
     * Single source of truth — frontend reads this via the validation
     * layer, never reimplements it.
     */
    public Set<StoryStatus> allowedStatuses() {
        return switch (this) {
            case STORY_WITH_CHAPTERS -> EnumSet.of(
                    StoryStatus.DRAFT,
                    StoryStatus.ONGOING,
                    StoryStatus.COMPLETED,
                    StoryStatus.ARCHIVED
            );
            case SHORT_STORY, ARTICLE, POEM -> EnumSet.of(
                    StoryStatus.DRAFT,
                    StoryStatus.PUBLISHED,
                    StoryStatus.ARCHIVED
            );
        };
    }
}