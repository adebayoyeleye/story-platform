package com.storyplatform.contentservice.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

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
    private List<StoryContributor> contributors = new ArrayList<>();
    // Optional: cached display string for public UI ("Bayo", "Bayo & Tolu", etc.)
    private String byline;
    private ContentType contentType;

    protected Story() {}

    public Story(String title, String authorId, String synopsis) {
        this.title = title;
        this.authorId = authorId;
        this.synopsis = synopsis;
        this.status = StoryStatus.DRAFT;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Story(String title, String authorId, String synopsis, ContentType contentType) {
        this(title, authorId, synopsis);
        this.contentType = contentType;
    }

    // getters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthorId() { return authorId; }
    public String getSynopsis() { return synopsis; }
    public StoryStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<StoryContributor> getContributors() { return contributors; }
    public void setContributors(List<StoryContributor> contributors) { this.contributors = contributors; }

    public String getByline() { return byline; }
    public void setByline(String byline) { this.byline = byline; }
    /**
     * Defaults to STORY_WITH_CHAPTERS when null so legacy documents
     * (created before this field existed) round-trip safely. New stories
     * should always set this explicitly via the constructor.
     */
    public ContentType getContentType() {
        return contentType != null ? contentType : ContentType.STORY_WITH_CHAPTERS;
    }

    public void setContentType(ContentType contentType) {
        this.contentType = contentType;
        this.updatedAt = java.time.Instant.now();
    }

    // controlled mutations
    public void setStatus(StoryStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public void setTitle(String title2) {
        this.title = title2;
        this.updatedAt = Instant.now();
    }

    public void setSynopsis(String synopsis2) {
        this.synopsis = synopsis2;
        this.updatedAt = Instant.now();
    }
}
