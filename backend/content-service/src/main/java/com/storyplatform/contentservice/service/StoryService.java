package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.dto.StoryRequestDto;
import com.storyplatform.contentservice.dto.StoryResponseDto;

import java.util.List;

public interface StoryService {

    StoryResponseDto createStory(StoryRequestDto request);

    List<StoryResponseDto> getAllStories();
}
