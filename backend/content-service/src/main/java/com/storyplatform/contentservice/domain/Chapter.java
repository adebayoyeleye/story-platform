package com.storyplatform.contentservice.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@CompoundIndexes({
    @CompoundIndex(
        name = "story_chapter_order_idx",
        def = "{'storyId': 1, 'chapterNumber': 1}"
    )
})
@Document(collection = "chapters")
public class Chapter {

    @Id
    private String id;

    private String storyId;
    private String title;
    private String content;
    private int chapterNumber;
    private ChapterStatus status;

    private Instant createdAt;
    private Instant updatedAt;

    protected Chapter() {}

    public Chapter(
            String storyId,
            String title,
            String content,
            int chapterNumber,
            ChapterStatus status
    ) {
        this.storyId = storyId;
        this.title = title;
        this.content = content;
        this.chapterNumber = chapterNumber;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // getters
    public String getId() { return id; }
    public String getStoryId() { return storyId; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public int getChapterNumber() { return chapterNumber; }
    public ChapterStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    // controlled mutations
    public void setChapterNumber(int chapterNumber) {
        this.chapterNumber = chapterNumber;
        this.updatedAt = Instant.now();
    }

    public void setStatus(ChapterStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public void setTitle(String title2) {
        this.title = title2;
        this.updatedAt = Instant.now();
    }

    public void setContent(String content2) {
        this.content = content2;
        this.updatedAt = Instant.now();
    }
}
