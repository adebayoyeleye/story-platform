package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.dto.*;
import com.storyplatform.contentservice.model.Story;
import com.storyplatform.contentservice.model.Chapter;
import com.storyplatform.contentservice.repository.StoryRepository;
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
            request.chapters().stream()
                .map(c -> new Chapter(c.title(), c.content()))
                .toList()
        );

        Story saved = repository.save(story);

        return mapToResponse(saved);
    }

    @Override
    public PagedResponseDto<StoryResponseDto> getStories(PageRequestDto pageRequest) {

        // Phase 1: stubbed data (repository comes next phase)
        // List<StoryResponseDto> stories = List.of();
        // long totalItems = 0;

        // This is not paged...to be removed later when pagination is implemented in repository
        List<StoryResponseDto> stories = repository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();

        // Also to be replaced later
        long totalItems = stories.size();

        return new PagedResponseDto<>(
            stories,
            pageRequest.getPage(),
            pageRequest.getSize(),
            totalItems
        );
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
