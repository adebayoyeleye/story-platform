package com.storyplatform.contentservice.controller;

import com.storyplatform.contentservice.dto.PageRequestDto;
import com.storyplatform.contentservice.dto.PagedResponseDto;
import com.storyplatform.contentservice.dto.StoryRequestDto;
import com.storyplatform.contentservice.dto.StoryResponseDto;
import com.storyplatform.contentservice.service.StoryService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/stories")
@Validated
public class StoryController {

    private final StoryService service;

    public StoryController(StoryService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StoryResponseDto> create(
            @Valid @RequestBody StoryRequestDto request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.create(request));
    }

    @GetMapping
    public ResponseEntity<PagedResponseDto<StoryResponseDto>> getStories(
            @Valid PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                service.getStories(pageRequest)
        );
    }
}
