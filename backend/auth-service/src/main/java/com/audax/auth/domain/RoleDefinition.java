package com.audax.auth.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.UUID;

@Document(collection = "role_definitions")
public class RoleDefinition {

    @Id
    private String id = UUID.randomUUID().toString();

    /**
     * App identifier, e.g. "storyapp"
     */
    @Indexed
    private String appId;

    /**
     * Role name, e.g. "WRITER"
     */
    @Indexed(unique = true)
    private String name;

    private String description;

    private Instant createdAt = Instant.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAppId() { return appId; }
    public void setAppId(String appId) { this.appId = appId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
