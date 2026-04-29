package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.ContentFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
// import jakarta.validation.constraints.Size;

public record ChapterRequestDto(

        @NotBlank(message = "Title is required")
        // @Size(max = 200, message = "Title must be at most 200 characters")
        String title,

        // @Size(max = 50000, message = "Content must be at most 50000 characters")
        String content,

        ContentFormat contentFormat,

        @NotNull(message = "Chapter number is required")
        @Min(value = 1, message = "Chapter number must be at least 1")
        Integer chapterNumber
) {}