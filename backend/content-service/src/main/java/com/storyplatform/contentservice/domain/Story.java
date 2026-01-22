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
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<StoryContributor> getContributors() { return contributors; }
    public void setContributors(List<StoryContributor> contributors) { this.contributors = contributors; }

    public String getByline() { return byline; }
    public void setByline(String byline) { this.byline = byline; }

    // controlled mutations
    public void setStatus(StoryStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }
}
