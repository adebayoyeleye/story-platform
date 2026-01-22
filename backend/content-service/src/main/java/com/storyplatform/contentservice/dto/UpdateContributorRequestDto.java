package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.ContributorRole;

public record UpdateContributorRequestDto(
        ContributorRole role,
        String penName
) {}
