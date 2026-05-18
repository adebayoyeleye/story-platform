package com.storyplatform.contentservice.domain;

/**
 * Discriminates which collection a polymorphic reference points at —
 * used by analytics events, and (later) comments and bookmarks.
 *
 * Distinct from {@link ContentType}, which discriminates what kind of
 * literary work a Story represents. ContentRefType is "what entity?",
 * ContentType is "what form?"
 */

public enum ContentRefType {
    STORY,
    CHAPTER,
    PAGE
    // SHORT_STORY, BLOG_POST, ARTICLE will be added in future
}