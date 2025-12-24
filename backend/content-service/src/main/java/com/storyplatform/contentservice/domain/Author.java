package com.storyplatform.contentservice.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "authors")
public class Author {

    @Id
    private String id;

    @Indexed(unique = true)
    private String displayName;

    private String bio;

    protected Author() {}

    public Author(String displayName, String bio) {
        this.displayName = displayName;
        this.bio = bio;
    }

    public String getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getBio() {
        return bio;
    }
}
