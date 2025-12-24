package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.StoryStatus;

public record StoryResponseDto(
        String id,
        String title,
        String authorId,
        String synopsis,
        StoryStatus status
) {}
