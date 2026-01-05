package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.domain.Story;
import com.storyplatform.contentservice.domain.StoryStatus;
import com.storyplatform.contentservice.exception.ResourceNotFoundException;
import com.storyplatform.contentservice.repository.StoryRepository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class StoryServiceImpl implements StoryService {

    private final StoryRepository storyRepository;

    public StoryServiceImpl(StoryRepository storyRepository) {
        this.storyRepository = storyRepository;
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

    private void enforcePageSize(Pageable pageable) {
        if (pageable.getPageSize() > 50) {
            throw new IllegalArgumentException("Page size cannot exceed 50");
        }
    }
}
