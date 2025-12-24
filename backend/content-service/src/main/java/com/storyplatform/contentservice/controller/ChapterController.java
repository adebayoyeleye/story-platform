package com.storyplatform.contentservice.controller;

import com.storyplatform.contentservice.domain.Chapter;
import com.storyplatform.contentservice.domain.ChapterStatus;
import com.storyplatform.contentservice.dto.ChapterRequestDto;
import com.storyplatform.contentservice.dto.ChapterResponseDto;
import com.storyplatform.contentservice.service.ChapterService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/chapters")
@Validated
public class ChapterController {

    private final ChapterService chapterService;

    public ChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }

    @PostMapping
    public ResponseEntity<ChapterResponseDto> create(
            @Valid @RequestBody ChapterRequestDto request
    ) {
        Chapter chapter = new Chapter(
                request.storyId(),
                request.title(),
                request.content(),
                request.chapterNumber(),
                ChapterStatus.DRAFT
        );

        Chapter saved = chapterService.createChapter(chapter);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(saved));
    }

    @PostMapping("/insert")
    public ResponseEntity<ChapterResponseDto> insert(
            @Valid @RequestBody ChapterRequestDto request,
            @RequestParam int position
    ) {
        Chapter chapter = new Chapter(
                request.storyId(),
                request.title(),
                request.content(),
                position,
                ChapterStatus.DRAFT
        );

        Chapter saved =
                chapterService.insertChapter(
                        request.storyId(),
                        chapter,
                        position
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(saved));
    }

    @PatchMapping("/{chapterId}/status")
    public ResponseEntity<ChapterResponseDto> updateStatus(
            @PathVariable String chapterId,
            @RequestParam ChapterStatus status
    ) {
        Chapter updated =
                chapterService.updateStatus(chapterId, status);

        return ResponseEntity.ok(toResponse(updated));
    }

    @GetMapping("/story/{storyId}")
    public ResponseEntity<Page<ChapterResponseDto>> getByStory(
            @PathVariable String storyId,
            Pageable pageable
    ) {
        Page<ChapterResponseDto> result =
                chapterService
                        .getChaptersByStory(storyId, pageable)
                        .map(this::toResponse);

        return ResponseEntity.ok(result);
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
}
