package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.domain.Chapter;
import com.storyplatform.contentservice.domain.ChapterStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChapterService {

    Chapter createChapter(Chapter chapter);

    Chapter insertChapter(String storyId, Chapter chapter, int position);

    Chapter updateDraftContent(String chapterId, String title, String content);

    Chapter updateStatus(String chapterId, ChapterStatus status);

    Page<Chapter> getChaptersByStory(String storyId, Pageable pageable);

    Page<Chapter> getPublishedChaptersByStory(String storyId, Pageable pageable);

    Chapter getDraftableById(String chapterId);

    Chapter getById(String chapterId);

}
