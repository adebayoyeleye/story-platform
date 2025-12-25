package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.domain.Chapter;
import com.storyplatform.contentservice.domain.ChapterStatus;
import com.storyplatform.contentservice.domain.Story;
import com.storyplatform.contentservice.exception.ResourceNotFoundException;
import com.storyplatform.contentservice.repository.ChapterRepository;
import com.storyplatform.contentservice.repository.StoryRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;
    private final StoryRepository storyRepository;

    public ChapterServiceImpl(
            ChapterRepository chapterRepository,
            StoryRepository storyRepository
    ) {
        this.chapterRepository = chapterRepository;
        this.storyRepository = storyRepository;
    }

    @Override
    public Chapter createChapter(Chapter chapter) {
        return chapterRepository.save(chapter);
    }

    /**
     * Insert chapter at position (1-based).
     * Re-indexes subsequent chapters — scoped to a single story.
     */
    @Override
    public Chapter insertChapter(String storyId, Chapter chapter, int position) {

        if (position < 1) {
            throw new IllegalArgumentException("Chapter position must be >= 1");
        }

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        List<Chapter> chapters = chapterRepository
                .findByStoryId(storyId, Pageable.unpaged())
                .getContent();

        chapters.stream()
                .filter(c -> c.getChapterNumber() >= position)
                .forEach(c -> {
                    c.setChapterNumber(c.getChapterNumber() + 1);
                    chapterRepository.save(c);
                });

        chapter.setChapterNumber(position);
        Chapter saved = chapterRepository.save(chapter);

        story.getChapterIds().add(position - 1, saved.getId());
        storyRepository.save(story);

        return saved;
    }

    @Override
    public Chapter updateDraftContent(String chapterId, String title, String content) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));

        if (chapter.getStatus() == ChapterStatus.PUBLISHED) {
            throw new IllegalArgumentException("Cannot edit a published chapter in Phase 1");
        }

        chapter.setTitle(title);
        chapter.setContent(content);
        return chapterRepository.save(chapter);
    }

    @Override
    public Chapter updateStatus(String chapterId, ChapterStatus status) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));

        chapter.setStatus(status);
        return chapterRepository.save(chapter);
    }

    @Override
    public Page<Chapter> getChaptersByStory(String storyId, Pageable pageable) {
        return chapterRepository.findByStoryId(storyId, pageable);
    }

    @Override
    public Page<Chapter> getPublishedChaptersByStory(String storyId, Pageable pageable) {
        return chapterRepository.findByStoryIdAndStatus(storyId, ChapterStatus.PUBLISHED, pageable);
    }


    @Override
    public Chapter getById(String chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));

        if (chapter.getStatus() != ChapterStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Chapter not found");
        }
        return chapter;
    }

    @Override
    public Chapter getDraftableById(String chapterId) {
        return chapterRepository.findById(chapterId)
            .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));
    }

}
