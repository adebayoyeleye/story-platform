package com.storyplatform.contentservice.controller;

import com.storyplatform.contentservice.domain.Chapter;
import com.storyplatform.contentservice.domain.ChapterStatus;
import com.storyplatform.contentservice.domain.ContentFormat;
import com.storyplatform.contentservice.domain.ContentRevision;
import com.storyplatform.contentservice.dto.ChapterEditRequestDto;
import com.storyplatform.contentservice.dto.ChapterRequestDto;
import com.storyplatform.contentservice.dto.ChapterResponseDto;
import com.storyplatform.contentservice.dto.ChapterSummaryResponseDto;
// import com.storyplatform.contentservice.dto.ChapterUpdateRequestDto;
import com.storyplatform.contentservice.dto.ContentRevisionResponseDto;
import com.storyplatform.contentservice.service.ChapterService;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    // =========================
    // PUBLIC (Reader) endpoints
    // =========================

    @GetMapping("/stories/{storyId}/chapters")
    public ResponseEntity<Page<ChapterSummaryResponseDto>> getPublishedChaptersByStory(
            @PathVariable String storyId,
            Pageable pageable
    ) {
        Page<ChapterSummaryResponseDto> result =
                chapterService.getPublishedChaptersByStory(storyId, pageable)
                        .map(this::toSummaryResponse);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/chapters/{chapterId}")
    public ResponseEntity<ChapterResponseDto> getById(@PathVariable String chapterId) {
        Chapter chapter = chapterService.getById(chapterId);
        return ResponseEntity.ok(toResponse(chapter));
    }

    // =========================
    // WRITER endpoints
    // =========================

    @PostMapping("/writer/stories/{storyId}/chapters")
    public ResponseEntity<ChapterResponseDto> create(
            @PathVariable String storyId,
            @Valid @RequestBody ChapterRequestDto request
    ) {
        ContentFormat format =
                request.contentFormat() == null ? ContentFormat.PLAIN_TEXT : request.contentFormat();

        Chapter chapter = new Chapter(
                storyId,
                request.title(),
                request.content(),
                format,
                request.chapterNumber(),
                ChapterStatus.DRAFT
        );

        Chapter saved = chapterService.createChapter(chapter);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PostMapping("/writer/stories/{storyId}/chapters/insert")
    public ResponseEntity<ChapterResponseDto> insert(
            @PathVariable String storyId,
            @Valid @RequestBody ChapterRequestDto request,
            @RequestParam int position
    ) {
        Chapter chapter = new Chapter(
                storyId,
                request.title(),
                request.content(),
                request.contentFormat() == null ? ContentFormat.RICH_TEXT_HTML : request.contentFormat(),
                position,
                ChapterStatus.DRAFT
        );

        Chapter saved = chapterService.insertChapter(storyId, chapter, position);

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/writer/chapters/{chapterId}")
    public ResponseEntity<ChapterResponseDto> editChapter(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String chapterId,
            @Valid @RequestBody ChapterEditRequestDto request
    ) {
        ContentFormat format = request.contentFormat() == null
                ? ContentFormat.PLAIN_TEXT : request.contentFormat();
    
        Chapter updated = chapterService.editContent(
                chapterId,
                jwt.getSubject(),
                request.title(),
                request.content(),
                format,
                request.publishImmediately()
        );
        return ResponseEntity.ok(toResponse(updated));
    }
    
    @PostMapping("/writer/chapters/{chapterId}/revisions/{revisionId}/publish")
    public ResponseEntity<ChapterResponseDto> publishRevision(
            @PathVariable String chapterId,
            @PathVariable String revisionId
    ) {
        Chapter updated = chapterService.publishRevision(chapterId, revisionId);
        return ResponseEntity.ok(toResponse(updated));
    }
    
    @GetMapping("/writer/chapters/{chapterId}/revisions")
    public ResponseEntity<Page<ContentRevisionResponseDto>> getRevisions(
            @PathVariable String chapterId,
            Pageable pageable
    ) {
        Page<ContentRevisionResponseDto> result = chapterService
                .getChapterRevisions(chapterId, pageable)
                .map(this::toRevisionResponse);
        return ResponseEntity.ok(result);
    }
    
    private ContentRevisionResponseDto toRevisionResponse(ContentRevision r) {
        return new ContentRevisionResponseDto(
                r.getId(),
                r.getRevisionNumber(),
                r.getTitle(),
                r.getAuthorId(),
                r.getCreatedAt(),
                r.getPublishedAt()
        );
    }

    @PatchMapping("/writer/chapters/{chapterId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable String chapterId,
            @RequestParam ChapterStatus status
    ) {
        chapterService.updateStatus(chapterId, status);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/writer/stories/{storyId}/chapters")
    public ResponseEntity<Page<ChapterSummaryResponseDto>> getAllChaptersByStoryWriter(
            @PathVariable String storyId,
            Pageable pageable
    ) {
        Page<ChapterSummaryResponseDto> result =
                chapterService.getChaptersByStory(storyId, pageable)
                        .map(this::toSummaryResponse);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/writer/chapters/{chapterId}")
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
                chapter.getContentFormat(),
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
