package com.storyplatform.contentservice.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "stories")
public class Story {

    @Id
    private String id;

    private String title;
    private String authorId;
    private String synopsis;
    private StoryStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    protected Story() {}

    public Story(String title, String authorId, String synopsis) {
        this.title = title;
        this.authorId = authorId;
        this.synopsis = synopsis;
        this.status = StoryStatus.DRAFT;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // getters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthorId() { return authorId; }
    public String getSynopsis() { return synopsis; }
    public StoryStatus getStatus() { return status; }

    // controlled mutations
    public void setStatus(StoryStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }
}
