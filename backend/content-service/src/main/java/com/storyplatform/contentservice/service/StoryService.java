package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.dto.StoryRequestDto;
import com.storyplatform.contentservice.dto.StoryResponseDto;
import com.storyplatform.contentservice.dto.PageRequestDto;
import com.storyplatform.contentservice.dto.PagedResponseDto;

public interface StoryService {

    StoryResponseDto create(StoryRequestDto request);

    PagedResponseDto<StoryResponseDto> getStories(PageRequestDto pageRequest);
}

