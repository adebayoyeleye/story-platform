package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.ContributorRole;
import java.time.Instant;

public record StoryContributorDto(
        String userId,
        ContributorRole role,
        String penName,
        Instant addedAt
) {}
