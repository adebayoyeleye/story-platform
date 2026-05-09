package com.storyplatform.contentservice.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "content_revisions")
@CompoundIndexes({
    @CompoundIndex(
        name = "parent_revision_idx",
        def = "{'parentId': 1, 'parentType': 1, 'revisionNumber': -1}"
    )
})
public class ContentRevision {

    @Id
    private String id;

    private String parentId;
    private ContentParentType parentType;
    private int revisionNumber;

    private String title;
    private String content;
    private ContentFormat contentFormat;

    private String authorId;
    private Instant createdAt;
    private Instant publishedAt;

    protected ContentRevision() {}

    public ContentRevision(
            String parentId,
            ContentParentType parentType,
            int revisionNumber,
            String title,
            String content,
            ContentFormat contentFormat,
            String authorId
    ) {
        this.parentId = parentId;
        this.parentType = parentType;
        this.revisionNumber = revisionNumber;
        this.title = title;
        this.content = content;
        this.contentFormat = contentFormat;
        this.authorId = authorId;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getParentId() { return parentId; }
    public ContentParentType getParentType() { return parentType; }
    public int getRevisionNumber() { return revisionNumber; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public ContentFormat getContentFormat() { return contentFormat; }
    public String getAuthorId() { return authorId; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getPublishedAt() { return publishedAt; }

    public void markPublished() {
        this.publishedAt = Instant.now();
    }
}