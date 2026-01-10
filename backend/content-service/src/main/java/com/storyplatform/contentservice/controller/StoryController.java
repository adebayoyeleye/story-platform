package com.storyplatform.contentservice.controller;

import com.storyplatform.contentservice.domain.Story;
import com.storyplatform.contentservice.domain.StoryStatus;
import com.storyplatform.contentservice.dto.StoryRequestDto;
import com.storyplatform.contentservice.dto.StoryResponseDto;
import com.storyplatform.contentservice.service.StoryService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/content/stories")
@Validated
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @PostMapping
    public ResponseEntity<StoryResponseDto> create(
            @Valid @RequestBody StoryRequestDto request
    ) {
        Story story = new Story(
                request.title(),
                request.authorId(),
                request.synopsis()
        );

        Story saved = storyService.create(story);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(saved));
    }

    /**
     * Public library listing: only ONGOING/COMPLETED (already enforced in service)
     */
    @GetMapping
    public ResponseEntity<Page<StoryResponseDto>> getStories(
            @PageableDefault(
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        Page<StoryResponseDto> result =
                storyService.getStories(pageable)
                        .map(this::toResponse);

        return ResponseEntity.ok(result);
    }

    /**
     * Public story read: only ONGOING/COMPLETED; otherwise return 404
     */
    @GetMapping("/{storyId}")
    public ResponseEntity<StoryResponseDto> getById(@PathVariable String storyId) {
        Story story = storyService.getPublicById(storyId);
        return ResponseEntity.ok(toResponse(story));
    }

    /**
     * Writer/Admin story read: can load DRAFT/ARCHIVED too
     */
    @GetMapping("/admin/{storyId}")
    public ResponseEntity<StoryResponseDto> getByIdAdmin(@PathVariable String storyId) {
        Story story = storyService.getAdminById(storyId);
        return ResponseEntity.ok(toResponse(story));
    }

    @PatchMapping("/{storyId}/status")
    public ResponseEntity<StoryResponseDto> updateStatus(
            @PathVariable String storyId,
            @RequestParam StoryStatus status
    ) {
        Story updated = storyService.updateStatus(storyId, status);
        return ResponseEntity.ok(toResponse(updated));
    }

    /**
     * Writer/Admin listing by authorId (your current endpoint)
     */
    @GetMapping("/admin")
    public ResponseEntity<Page<StoryResponseDto>> getStoriesByAuthor(
            @RequestParam String authorId,
            Pageable pageable
    ) {
        Page<StoryResponseDto> result =
                storyService.getStoriesByAuthor(authorId, pageable)
                        .map(this::toResponse);

        return ResponseEntity.ok(result);
    }

    private StoryResponseDto toResponse(Story story) {
        return new StoryResponseDto(
                story.getId(),
                story.getTitle(),
                story.getAuthorId(),
                story.getSynopsis(),
                story.getStatus()
        );
    }
}
