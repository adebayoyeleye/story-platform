package com.storyplatform.contentservice.dto;

import jakarta.validation.constraints.NotBlank;

public record ChapterUpdateRequestDto(
        @NotBlank String title,
        @NotBlank String content
) {}
