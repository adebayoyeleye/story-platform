package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.ChapterStatus;

public record ChapterSummaryResponseDto(
        String id,
        String title,
        int chapterNumber,
        ChapterStatus status
) {}
