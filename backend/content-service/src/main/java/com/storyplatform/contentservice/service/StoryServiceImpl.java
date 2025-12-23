package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.dto.*;
import com.storyplatform.contentservice.model.Story;
import com.storyplatform.contentservice.model.Chapter;
import com.storyplatform.contentservice.repository.StoryRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StoryServiceImpl implements StoryService {

    private final StoryRepository repository;

    public StoryServiceImpl(StoryRepository repository) {
        this.repository = repository;
    }

    @Override
    public StoryResponseDto create(StoryRequestDto request) {

        Story story = new Story(
                null,
                request.title(),
                request.author(),
                request.synopsis(),
                request.chapters() == null
                        ? List.of()
                        : request.chapters().stream()
                            .map(c -> new Chapter(c.title(), c.content()))
                            .toList()
        );

        return mapToResponse(repository.save(story));
    }

    @Override
    public Page<StoryResponseDto> getStories(Pageable pageable) {

        enforcePageSize(pageable);

        return repository.findAll(pageable)
                .map(this::mapToResponse);
    }

    private void enforcePageSize(Pageable pageable) {
        if (pageable.getPageSize() > 50) {
            throw new IllegalArgumentException("Page size cannot exceed 50");
        }
    }

    private StoryResponseDto mapToResponse(Story story) {
        return new StoryResponseDto(
                story.id(),
                story.title(),
                story.author(),
                story.synopsis(),
                story.chapters() == null
                        ? List.of()
                        : story.chapters().stream()
                            .map(c -> new ChapterDto(c.title(), c.content()))
                            .toList()
        );
    }
}
