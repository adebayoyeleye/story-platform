package com.storyplatform.contentservice.controller;

import com.storyplatform.contentservice.domain.ContentRefType;
import com.storyplatform.contentservice.dto.ContentStatsResponseDto;
import com.storyplatform.contentservice.dto.RecordViewRequestDto;
import com.storyplatform.contentservice.service.AnalyticsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/content/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // Public — no auth. Anonymous readers must be able to fire this.
    @PostMapping("/views")
    public ResponseEntity<Void> recordView(@Valid @RequestBody RecordViewRequestDto req) {
        analyticsService.recordView(req.contentId(), req.contentType(), req.sessionId());
        return ResponseEntity.accepted().build();   // 202: we'll process, no response body
    }

    // Writer-facing — authenticated. Per-content rollup.
    @GetMapping("/writer/content/{contentType}/{contentId}/stats")
    public ResponseEntity<ContentStatsResponseDto> getContentStats(
            @PathVariable ContentRefType contentType,
            @PathVariable String contentId
    ) {
        ContentStatsResponseDto stats = new ContentStatsResponseDto(
                analyticsService.totalViews(contentId, contentType),
                analyticsService.viewsInLastDays(contentId, contentType, 1),
                analyticsService.viewsInLastDays(contentId, contentType, 7),
                analyticsService.viewsInLastDays(contentId, contentType, 30)
        );
        return ResponseEntity.ok(stats);
    }
}