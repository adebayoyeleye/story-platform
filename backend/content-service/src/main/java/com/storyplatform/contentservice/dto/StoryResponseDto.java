package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.StoryStatus;
import java.util.List;

public record StoryResponseDto(
        String id,
        String title,
        String synopsis,
        StoryStatus status,
        String byline,
        List<StoryContributorDto> contributors // useful for writer UI
) {}
