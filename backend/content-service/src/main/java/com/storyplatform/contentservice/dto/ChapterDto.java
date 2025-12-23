package com.storyplatform.contentservice.dto;

import jakarta.validation.constraints.NotBlank;

public record ChapterDto(

    @NotBlank(message = "Chapter title is required")
    String title,

    @NotBlank(message = "Chapter content is required")
    String content
) {}
