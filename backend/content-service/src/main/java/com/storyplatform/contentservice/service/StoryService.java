package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.dto.StoryRequestDto;
import com.storyplatform.contentservice.dto.StoryResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StoryService {

    StoryResponseDto create(StoryRequestDto request);

    Page<StoryResponseDto> getStories(Pageable pageable);
}
