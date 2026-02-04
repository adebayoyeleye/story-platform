package com.storyplatform.contentservice.dto;

import jakarta.validation.constraints.NotBlank;

public record WriterStoryCreateRequestDto(
        @NotBlank String title,
        String synopsis,
        String penName
) {}
