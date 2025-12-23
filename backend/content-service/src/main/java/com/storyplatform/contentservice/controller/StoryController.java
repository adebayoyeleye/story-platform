package com.storyplatform.contentservice.controller;

import com.storyplatform.contentservice.dto.StoryRequestDto;
import com.storyplatform.contentservice.dto.StoryResponseDto;
import com.storyplatform.contentservice.service.StoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/stories")
public class StoryController {

    private final StoryService service;

    public StoryController(StoryService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StoryResponseDto> createStory(
            @RequestBody StoryRequestDto request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.createStory(request));
    }

    @GetMapping
    public List<StoryResponseDto> getAllStories() {
        return service.getAllStories();
    }
}
