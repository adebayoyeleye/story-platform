package com.storyplatform.contentservice.controller;

import com.storyplatform.contentservice.domain.Story;
import com.storyplatform.contentservice.domain.StoryStatus;
import com.storyplatform.contentservice.dto.StoryResponseDto;
import com.storyplatform.contentservice.dto.WriterStoryCreateRequestDto;
import com.storyplatform.contentservice.service.StoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/content")
@Validated
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    // =========================
    // PUBLIC (Reader) endpoints
    // =========================

    /**
     * Public library listing: only ONGOING/COMPLETED (enforced in service)
     */
    @GetMapping("/stories")
    public ResponseEntity<Page<StoryResponseDto>> getStories(
            @PageableDefault(
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        Page<StoryResponseDto> result =
                storyService.getStories(pageable).map(this::toResponse);

        return ResponseEntity.ok(result);
    }

    /**
     * Public story read: only ONGOING/COMPLETED; otherwise 404
     */
    @GetMapping("/stories/{storyId}")
    public ResponseEntity<StoryResponseDto> getById(@PathVariable String storyId) {
        Story story = storyService.getPublicById(storyId);
        return ResponseEntity.ok(toResponse(story));
    }

    // =========================
    // WRITER endpoints
    // =========================
    // NOTE: These are capability endpoints.
    // Authorization = role (WRITER) + ownership checks in Phase 3 (service layer).
    // For Phase 2, we enforce role in SecurityConfig and keep behavior consistent.
    // WRITER: Create story (authorId comes from token)

    @PostMapping("/writer/stories")
    public ResponseEntity<StoryResponseDto> createWriter(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody WriterStoryCreateRequestDto request
    ) {
        String authorId = jwt.getSubject(); // ✅ source of truth

        Story story = new Story(request.title(), authorId, request.synopsis());
        Story saved = storyService.create(story);

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    /**
     * Writer can load DRAFT/ARCHIVED too (no "admin" naming)
     */
    @GetMapping("/writer/stories/{storyId}")
    public ResponseEntity<StoryResponseDto> getByIdWriter(@PathVariable String storyId) {
        Story story = storyService.getAdminById(storyId); // rename later if you want: getWriterById(...)
        return ResponseEntity.ok(toResponse(story));
    }

    // WRITER: List my stories (authorId comes from token)
    @GetMapping("/writer/stories")
    public ResponseEntity<Page<StoryResponseDto>> getMyStories(
            @AuthenticationPrincipal Jwt jwt,
            Pageable pageable
    ) {
        String authorId = jwt.getSubject(); // ✅ source of truth

        Page<StoryResponseDto> result =
                storyService.getStoriesByAuthor(authorId, pageable)
                        .map(this::toResponse);

        return ResponseEntity.ok(result);
    }

    /**
     * Writer updates story status (DRAFT->ONGOING->COMPLETED->ARCHIVED)
     */
    @PatchMapping("/writer/stories/{storyId}/status")
    public ResponseEntity<StoryResponseDto> updateStatusWriter(
            @PathVariable String storyId,
            @RequestParam StoryStatus status
    ) {
        Story updated = storyService.updateStatus(storyId, status);
        return ResponseEntity.ok(toResponse(updated));
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
