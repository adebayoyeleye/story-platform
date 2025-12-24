package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.domain.Story;
import com.storyplatform.contentservice.domain.StoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StoryService {

    Story create(Story story);

    Page<Story> getStories(Pageable pageable);

    Story updateStatus(String storyId, StoryStatus status);
}
