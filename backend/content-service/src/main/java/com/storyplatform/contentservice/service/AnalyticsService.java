package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.domain.ContentRefType;
import com.storyplatform.contentservice.domain.PageViewEvent;
import com.storyplatform.contentservice.repository.PageViewRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AnalyticsService {

    private final PageViewRepository repo;

    public AnalyticsService(PageViewRepository repo) {
        this.repo = repo;
    }

    public void recordView(String contentId, ContentRefType contentType, String sessionId) {
        repo.save(new PageViewEvent(contentId, contentType, sessionId));
    }

    public long totalViews(String contentId, ContentRefType contentType) {
        return repo.countByContentIdAndContentType(contentId, contentType);
    }

    public long viewsInLastDays(String contentId, ContentRefType contentType, int days) {
        Instant from = Instant.now().minus(days, ChronoUnit.DAYS);
        return repo.countByContentIdAndContentTypeAndRecordedAtBetween(
                contentId, contentType, from, Instant.now());
    }

    public long siteViewsInLastDays(int days) {
        Instant from = Instant.now().minus(days, ChronoUnit.DAYS);
        return repo.countByRecordedAtBetween(from, Instant.now());
    }
}