package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.ContentFormat;
import jakarta.validation.constraints.NotBlank;

public record ChapterEditRequestDto(
        @NotBlank String title,
        String content,
        ContentFormat contentFormat,
        boolean publishImmediately
) {}