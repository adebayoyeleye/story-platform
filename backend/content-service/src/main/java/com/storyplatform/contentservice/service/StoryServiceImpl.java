package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.domain.Story;
import com.storyplatform.contentservice.domain.StoryStatus;
import com.storyplatform.contentservice.exception.ResourceNotFoundException;
import com.storyplatform.contentservice.repository.StoryRepository;

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
        return storyRepository.findAll(pageable);
    }

    @Override
    public Story getById(String storyId) {
        return storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));
    }

    @Override
    public Story updateStatus(String storyId, StoryStatus status) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

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
