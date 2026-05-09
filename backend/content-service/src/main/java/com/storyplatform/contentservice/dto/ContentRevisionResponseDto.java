package com.storyplatform.contentservice.dto;

import java.time.Instant;

public record ContentRevisionResponseDto(
        String id,
        int revisionNumber,
        String title,
        String authorId,
        Instant createdAt,
        Instant publishedAt   // null if unpublished
) {}