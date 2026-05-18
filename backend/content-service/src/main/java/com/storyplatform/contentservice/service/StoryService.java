package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.domain.ContentType;
import com.storyplatform.contentservice.domain.Story;
import com.storyplatform.contentservice.domain.StoryStatus;
import com.storyplatform.contentservice.dto.AddContributorRequestDto;
import com.storyplatform.contentservice.dto.UpdateContributorRequestDto;
import com.storyplatform.contentservice.dto.UpdateStoryMetaRequestDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StoryService {
    /**
     * Create a new Story owned by the given author.
     *
     * Seeds the OWNER contributor, defaults contentType to
     * STORY_WITH_CHAPTERS when null, computes the byline. All preconditions
     * for a valid Story are established by this method — callers don't need
     * to know about contributors or byline assembly.
     */
    Story createForAuthor(String authorId, String title, String synopsis,
                         String penName, ContentType contentType);
    // Story create(Story story);
    Page<Story> getStories(Pageable pageable);
    Story getPublicById(String storyId);
    Story getAdminById(String storyId);
    Story updateStatus(String storyId, StoryStatus status);
    Page<Story> getStoriesByAuthor(String authorId, Pageable pageable);
    Story updateStoryMeta(String storyId, String requesterUserId, UpdateStoryMetaRequestDto req);

    Story addContributor(String storyId, String requesterUserId, AddContributorRequestDto req);
    Story updateContributor(String storyId, String requesterUserId, String contributorUserId, UpdateContributorRequestDto req);
    Story removeContributor(String storyId, String requesterUserId, String contributorUserId);
}
