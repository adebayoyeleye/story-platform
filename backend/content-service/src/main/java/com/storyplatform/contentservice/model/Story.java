package com.storyplatform.contentservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

// Main Story Document
@Document(collection = "stories")
public record Story(
    @Id String id,
    String title,
    String author,
    String synopsis,        // Brief description for the home page
    List<Chapter> chapters  // Nested list of chapters
) {}

// Helper Record (No need for a separate file. it's small)
record Chapter(
    String title,
    String content
) {}