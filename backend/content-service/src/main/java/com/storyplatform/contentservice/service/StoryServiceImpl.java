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
    public StoryResponseDto createStory(StoryRequestDto request) {

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
    public List<StoryResponseDto> getAllStories() {
        return repository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private StoryResponseDto mapToResponse(Story story) {
        return new StoryResponseDto(
            story.id(),
            story.title(),
            story.author(),
            story.synopsis(),
            story.chapters().stream()
                .map(c -> new ChapterDto(c.title(), c.content()))
                .toList()
        );
    }
}
