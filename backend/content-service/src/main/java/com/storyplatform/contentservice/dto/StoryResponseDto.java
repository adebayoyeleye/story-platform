package com.storyplatform.contentservice.dto;

import com.storyplatform.contentservice.domain.ContentType;
import com.storyplatform.contentservice.domain.StoryStatus;
import java.util.List;

public record StoryResponseDto(
        String id,
        String title,
        String synopsis,
        StoryStatus status,
        ContentType contentType,
        String byline,
        List<StoryContributorDto> contributors
) {}