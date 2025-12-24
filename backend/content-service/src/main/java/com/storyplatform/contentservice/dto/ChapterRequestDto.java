package com.storyplatform.contentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;

public record ChapterRequestDto(
        @NotBlank(message = "Story ID is required")
        @Size(max = 36, message = "Story ID must be at most 36 characters")
        String storyId,

        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must be at most 200 characters")
        String title,

        @NotBlank(message = "Content is required")
        @Size(max = 5000, message = "Content must be at most 5000 characters")
        String content,

        @NotNull(message = "Chapter number is required")
        @Min(value = 1, message = "Chapter number must be at least 1")
        Integer chapterNumber
) {}

