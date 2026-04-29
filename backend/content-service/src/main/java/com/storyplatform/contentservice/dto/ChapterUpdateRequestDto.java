package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.ContentFormat;
import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.Size;

public record ChapterUpdateRequestDto(
        @NotBlank String title,
        // @Size(max = 50000) 
        String content,
        ContentFormat contentFormat
) {}