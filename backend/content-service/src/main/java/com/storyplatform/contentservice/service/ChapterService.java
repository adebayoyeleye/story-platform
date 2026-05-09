package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.domain.Chapter;
import com.storyplatform.contentservice.domain.ChapterStatus;
import com.storyplatform.contentservice.domain.ContentFormat;
import com.storyplatform.contentservice.domain.ContentRevision;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChapterService {

    Chapter createChapter(Chapter chapter);

    Chapter insertChapter(String storyId, Chapter chapter, int position);

    Chapter editContent(String chapterId, String authorId, String title, String content, ContentFormat contentFormat, boolean publishImmediately);

    Chapter updateStatus(String chapterId, ChapterStatus status);

    Page<Chapter> getChaptersByStory(String storyId, Pageable pageable);

    Page<Chapter> getPublishedChaptersByStory(String storyId, Pageable pageable);

    Chapter getDraftableById(String chapterId);

    Chapter getById(String chapterId);

    Chapter publishRevision(String chapterId, String revisionId);

    Page<ContentRevision> getChapterRevisions(String chapterId, Pageable pageable);

}
