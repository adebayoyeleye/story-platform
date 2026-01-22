package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.domain.Story;
import com.storyplatform.contentservice.domain.StoryStatus;
import com.storyplatform.contentservice.dto.AddContributorRequestDto;
import com.storyplatform.contentservice.dto.UpdateContributorRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StoryService {
    Story create(Story story);
    Page<Story> getStories(Pageable pageable);
    Story getPublicById(String storyId);
    Story getAdminById(String storyId);
    Story updateStatus(String storyId, StoryStatus status);
    Page<Story> getStoriesByAuthor(String authorId, Pageable pageable);

    Story addContributor(String storyId, String requesterUserId, AddContributorRequestDto req);
    Story updateContributor(String storyId, String requesterUserId, String contributorUserId, UpdateContributorRequestDto req);
    Story removeContributor(String storyId, String requesterUserId, String contributorUserId);
}
