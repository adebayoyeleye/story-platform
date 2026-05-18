package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.ContentType;
import jakarta.validation.constraints.NotBlank;

public record WriterStoryCreateRequestDto(
        @NotBlank String title,
        String synopsis,
        String penName,
        ContentType contentType   // null → service defaults to STORY_WITH_CHAPTERS
) {}