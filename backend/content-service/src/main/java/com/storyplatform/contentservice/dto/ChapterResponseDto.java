package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.ChapterStatus;

public record ChapterResponseDto(
        String id,
        String storyId,
        String title,
        String content,
        int chapterNumber,
        ChapterStatus status
) {}
