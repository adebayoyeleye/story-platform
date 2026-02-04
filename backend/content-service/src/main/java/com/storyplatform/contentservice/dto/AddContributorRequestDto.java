package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.ContributorRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddContributorRequestDto(
        @NotBlank String userId,
        @NotNull ContributorRole role,
        String penName
) {}
