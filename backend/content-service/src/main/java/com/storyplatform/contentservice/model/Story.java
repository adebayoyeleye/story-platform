package com.storyplatform.contentservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "stories")
public record Story(
    @Id String id,
    String title,
    String content,
    String author
) {}
