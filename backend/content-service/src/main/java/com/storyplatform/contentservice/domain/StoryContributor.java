package com.storyplatform.contentservice.domain;

import java.time.Instant;

public class StoryContributor {

    private String userId;            // from JWT sub
    private ContributorRole role;     // OWNER/CO_AUTHOR/EDITOR
    private String penName;           // display name for THIS story
    private Instant addedAt = Instant.now();

    public StoryContributor() {}

    public StoryContributor(String userId, ContributorRole role, String penName) {
        this.userId = userId;
        this.role = role;
        this.penName = penName;
        this.addedAt = Instant.now();
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public ContributorRole getRole() { return role; }
    public void setRole(ContributorRole role) { this.role = role; }

    public String getPenName() { return penName; }
    public void setPenName(String penName) { this.penName = penName; }

    public Instant getAddedAt() { return addedAt; }
    public void setAddedAt(Instant addedAt) { this.addedAt = addedAt; }
}
