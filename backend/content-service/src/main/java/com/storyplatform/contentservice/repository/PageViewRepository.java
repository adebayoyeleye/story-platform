package com.storyplatform.contentservice.repository;

import com.storyplatform.contentservice.domain.ContentRefType;
import com.storyplatform.contentservice.domain.PageViewEvent;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;

public interface PageViewRepository extends MongoRepository<PageViewEvent, String> {

    long countByContentIdAndContentType(String contentId, ContentRefType contentType);

    long countByContentIdAndContentTypeAndRecordedAtBetween(
            String contentId, ContentRefType contentType, Instant from, Instant to);

    long countByRecordedAtBetween(Instant from, Instant to);
}