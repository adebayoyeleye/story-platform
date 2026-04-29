package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.ChapterStatus;
import com.storyplatform.contentservice.domain.ContentFormat;

public record ChapterResponseDto(
        String id,
        String storyId,
        String title,
        String content,
        ContentFormat contentFormat,
        int chapterNumber,
        ChapterStatus status
) {}