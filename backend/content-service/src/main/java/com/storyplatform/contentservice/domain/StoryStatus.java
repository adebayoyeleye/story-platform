package com.storyplatform.contentservice.domain;

public enum StoryStatus {
    DRAFT,
    ONGOING,    // chaptered works only — actively releasing chapters
    COMPLETED,  // chaptered works only — all chapters done
    PUBLISHED,  // standalone works only — visible to readers
    ARCHIVED    // universal — writer retired the work
}