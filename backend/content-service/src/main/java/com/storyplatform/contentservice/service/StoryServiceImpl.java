package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.domain.ContributorRole;
import com.storyplatform.contentservice.domain.Story;
import com.storyplatform.contentservice.domain.StoryStatus;
import com.storyplatform.contentservice.dto.UpdateContributorRequestDto;
import com.storyplatform.contentservice.exception.ResourceNotFoundException;
import com.storyplatform.contentservice.repository.StoryRepository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import com.storyplatform.contentservice.domain.StoryContributor;

@Service
public class StoryServiceImpl implements StoryService {

    private final StoryRepository storyRepository;

    public StoryServiceImpl(StoryRepository storyRepository) {
        this.storyRepository = storyRepository;
    }
    
    private void enforcePageSize(Pageable pageable) {
        if (pageable.getPageSize() > 50) {
            throw new IllegalArgumentException("Page size cannot exceed 50");
        }
    }

    // private helpers

    private boolean isOwner(Story story, String userId) {
        return story.getContributors().stream()
                .anyMatch(c -> c.getUserId().equals(userId)
                        && c.getRole() == ContributorRole.OWNER);
    }

    private boolean isCoAuthor(Story story, String userId) {
        return story.getContributors().stream()
                .anyMatch(c -> c.getUserId().equals(userId)
                        && c.getRole() == ContributorRole.CO_AUTHOR);
    }

    private void requireOwner(Story story, String requesterUserId) {
        if (!isOwner(story, requesterUserId)) {
            throw new AccessDeniedException("Only OWNER can perform this action");
        }
    }

    private void requireOwnerOrCoAuthor(Story story, String requesterUserId) {
        if (!(isOwner(story, requesterUserId) || isCoAuthor(story, requesterUserId))) {
            throw new AccessDeniedException("Only OWNER or CO_AUTHOR can perform this action");
        }
    }

    @Override
    public Story create(Story story) {
        return storyRepository.save(story);
    }

    @Override
    public Page<Story> getStories(Pageable pageable) {
        enforcePageSize(pageable);
        return storyRepository.findByStatusIn(
                List.of(StoryStatus.ONGOING, StoryStatus.COMPLETED),
                pageable
        );
    }

    /**
     * Public read: only ONGOING/COMPLETED. Otherwise pretend it doesn't exist.
     */
    @Override
    public Story getPublicById(String storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        if (story.getStatus() != StoryStatus.ONGOING && story.getStatus() != StoryStatus.COMPLETED) {
            throw new ResourceNotFoundException("Story not found");
        }

        return story;
    }

    /**
     * Admin read: any status allowed.
     */
    @Override
    public Story getAdminById(String storyId) {
        return storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));
    }

    @Override
    public Story updateStatus(String storyId, StoryStatus status) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        StoryStatus current = story.getStatus();

        boolean allowed =
                (current == StoryStatus.DRAFT && (status == StoryStatus.ONGOING || status == StoryStatus.ARCHIVED))
                        || (current == StoryStatus.ONGOING && (status == StoryStatus.COMPLETED || status == StoryStatus.ARCHIVED))
                        || (current == StoryStatus.COMPLETED && (status == StoryStatus.ONGOING || status == StoryStatus.ARCHIVED))
                        || (current == StoryStatus.ARCHIVED && status == StoryStatus.ONGOING);

        if (!allowed) {
            throw new IllegalArgumentException("Invalid story status transition: " + current + " -> " + status);
        }

        story.setStatus(status);
        return storyRepository.save(story);
    }

    @Override
    public Page<Story> getStoriesByAuthor(String authorId, Pageable pageable) {
        enforcePageSize(pageable);
        return storyRepository.findByAuthorId(authorId, pageable);
    }

    @Override
    public Story addContributor(String storyId, String requesterUserId, com.storyplatform.contentservice.dto.AddContributorRequestDto req) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        // Phase-3-ish rule: only OWNER can manage contributors
        requireOwner(story, requesterUserId);

        boolean exists = story.getContributors().stream()
                .anyMatch(c -> c.getUserId().equals(req.userId()));
        if (exists) {
            throw new IllegalArgumentException("Contributor already exists");
        }

        story.getContributors().add(new StoryContributor(
                req.userId(), req.role(), req.penName()
        ));

        story.setByline(BylineBuilder.build(story));
        return storyRepository.save(story);
    }

    @Override
    public Story updateContributor(String storyId, String requesterUserId, String contributorUserId, UpdateContributorRequestDto req) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        requireOwner(story, requesterUserId);

        var contributor = story.getContributors().stream()
                .filter(c -> c.getUserId().equals(contributorUserId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Contributor not found"));

        // Prevent removing/changing OWNER role accidentally
        if (contributor.getRole() == ContributorRole.OWNER
                && req.role() != null
                && req.role() != ContributorRole.OWNER) {
            throw new IllegalArgumentException("Cannot change OWNER role");
        }

        if (req.role() != null) contributor.setRole(req.role());
        if (req.penName() != null) contributor.setPenName(req.penName());

        story.setByline(BylineBuilder.build(story));
        return storyRepository.save(story);
    }

    @Override
    public Story removeContributor(String storyId, String requesterUserId, String contributorUserId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        requireOwner(story, requesterUserId);

        var target = story.getContributors().stream()
                .filter(c -> c.getUserId().equals(contributorUserId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Contributor not found"));

        if (target.getRole() == ContributorRole.OWNER) {
            throw new IllegalArgumentException("Cannot remove OWNER");
        }

        story.getContributors().removeIf(c -> c.getUserId().equals(contributorUserId));
        story.setByline(BylineBuilder.build(story));
        return storyRepository.save(story);
    }
}
