package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.ContentRefType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RecordViewRequestDto(
        @NotBlank String contentId,
        @NotNull ContentRefType contentType,
        @NotBlank String sessionId
) {}