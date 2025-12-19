package com.storyplatform.contentservice.controller;

import com.storyplatform.contentservice.model.Story;
import com.storyplatform.contentservice.repository.StoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryRepository repository;

    // Constructor Injection (Best Practice)
    public StoryController(StoryRepository repository) {
        this.repository = repository;
    }

    // 1. Create a Story
    @PostMapping
    public Story createStory(@RequestBody Story story) {
        return repository.save(story);
    }

    // 2. Read all Stories
    @GetMapping
    public List<Story> getAllStories() {
        return repository.findAll();
    }
}