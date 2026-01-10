package com.storyplatform.contentservice.controller;

import com.storyplatform.contentservice.domain.Chapter;
import com.storyplatform.contentservice.domain.ChapterStatus;
import com.storyplatform.contentservice.dto.ChapterRequestDto;
import com.storyplatform.contentservice.dto.ChapterResponseDto;
import com.storyplatform.contentservice.dto.ChapterSummaryResponseDto;
import com.storyplatform.contentservice.dto.ChapterUpdateRequestDto;
import com.storyplatform.contentservice.service.ChapterService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/content")
@Validated
public class ChapterController {

    private final ChapterService chapterService;

    public ChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }

    @PostMapping("/stories/{storyId}/chapters")
    public ResponseEntity<ChapterResponseDto> create(
            @PathVariable String storyId,
            @Valid @RequestBody ChapterRequestDto request
    ) {
        Chapter chapter = new Chapter(
                storyId,
                request.title(),
                request.content(), // == null ? "" : request.content(),
                request.chapterNumber(),
                ChapterStatus.DRAFT
        );

        Chapter saved = chapterService.createChapter(chapter);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(saved));
    }

    @PostMapping("/stories/{storyId}/chapters/insert")
    public ResponseEntity<ChapterResponseDto> insert(
            @PathVariable String storyId,
            @Valid @RequestBody ChapterRequestDto request,
            @RequestParam int position
    ) {
        Chapter chapter = new Chapter(
                storyId,
                request.title(),
                request.content(), // == null ? "" : request.content(),
                position,
                ChapterStatus.DRAFT
        );

        Chapter saved =
                chapterService.insertChapter(
                        storyId,
                        chapter,
                        position
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(saved));
    }

    @PutMapping("/admin/chapters/{chapterId}")
    public ResponseEntity<ChapterResponseDto> updateDraft(
            @PathVariable String chapterId,
            @Valid @RequestBody ChapterUpdateRequestDto request
    ) {
        Chapter updated = chapterService.updateDraftContent(chapterId, request.title(), request.content());
        return ResponseEntity.ok(toResponse(updated));
    }

    @PatchMapping("/chapters/{chapterId}/status")
    public ResponseEntity<ChapterResponseDto> updateStatus(
            @PathVariable String chapterId,
            @RequestParam ChapterStatus status
    ) {
        chapterService.updateStatus(chapterId, status);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stories/{storyId}/chapters")
    public ResponseEntity<Page<ChapterSummaryResponseDto>> getPublishedChaptersByStory(
            @PathVariable String storyId,
            Pageable pageable
    ) {
        Page<ChapterSummaryResponseDto> result =
                chapterService
                        .getPublishedChaptersByStory(storyId, pageable)
                        .map(this::toSummaryResponse);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/admin/stories/{storyId}/chapters")
    public ResponseEntity<Page<ChapterSummaryResponseDto>> getAllChaptersByStoryAdmin(
            @PathVariable String storyId,
            Pageable pageable
    ) {
        Page<ChapterSummaryResponseDto> result =
        chapterService
                .getChaptersByStory(storyId, pageable)
                .map(this::toSummaryResponse);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/chapters/{chapterId}")
    public ResponseEntity<ChapterResponseDto> getById(@PathVariable String chapterId) {
        Chapter chapter = chapterService.getById(chapterId);
        return ResponseEntity.ok(toResponse(chapter));
    }

    @GetMapping("/admin/chapters/{chapterId}")
    public ResponseEntity<ChapterResponseDto> getDraftableById(@PathVariable String chapterId) {
        Chapter chapter = chapterService.getDraftableById(chapterId);
        return ResponseEntity.ok(toResponse(chapter));
    }
    
    private ChapterResponseDto toResponse(Chapter chapter) {
        return new ChapterResponseDto(
                chapter.getId(),
                chapter.getStoryId(),
                chapter.getTitle(),
                chapter.getContent(),
                chapter.getChapterNumber(),
                chapter.getStatus()
        );
    }

    private ChapterSummaryResponseDto toSummaryResponse(Chapter chapter) {
        return new ChapterSummaryResponseDto(
                chapter.getId(),
                chapter.getTitle(),
                chapter.getChapterNumber(),
                chapter.getStatus()
        );
    }
}