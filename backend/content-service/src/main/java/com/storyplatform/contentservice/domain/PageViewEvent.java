package com.storyplatform.contentservice.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "page_views")
@CompoundIndexes({
    @CompoundIndex(name = "content_time_idx", def = "{'contentId': 1, 'recordedAt': -1}"),
    @CompoundIndex(name = "session_content_idx", def = "{'sessionId': 1, 'contentId': 1, 'recordedAt': -1}")
})
public class PageViewEvent {

    @Id
    private String id;

    private String contentId;
    private ContentRefType contentType;   // see step 1.2
    private String sessionId;             // anonymous UUID from the browser

    @Indexed                              // for site-wide time-range queries
    private Instant recordedAt;

    protected PageViewEvent() {}

    public PageViewEvent(String contentId, ContentRefType contentType, String sessionId) {
        this.contentId = contentId;
        this.contentType = contentType;
        this.sessionId = sessionId;
        this.recordedAt = Instant.now();
    }

    public String getId() { return id; }
    public String getContentId() { return contentId; }
    public ContentRefType getContentType() { return contentType; }
    public String getSessionId() { return sessionId; }
    public Instant getRecordedAt() { return recordedAt; }
}