package com.storyplatform.contentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StoryRequestDto(
        @NotBlank(message = "Title is required")
        @Size(max = 200)
        String title,

        @NotBlank(message = "Author ID is required")
        @Size(max = 50)
        String authorId,

        @Size(max = 500, message = "Synopsis must be at most 500 characters")
        String synopsis
) {}

