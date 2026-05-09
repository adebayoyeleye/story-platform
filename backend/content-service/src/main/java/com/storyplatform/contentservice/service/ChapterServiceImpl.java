package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.config.ChapterProperties;
import com.storyplatform.contentservice.domain.Chapter;
import com.storyplatform.contentservice.domain.ChapterStatus;
import com.storyplatform.contentservice.domain.Story;
import com.storyplatform.contentservice.domain.StoryStatus;
import com.storyplatform.contentservice.domain.ContentFormat;
import com.storyplatform.contentservice.domain.ContentParentType;
import com.storyplatform.contentservice.domain.ContentRevision;
import com.storyplatform.contentservice.exception.ResourceNotFoundException;
import com.storyplatform.contentservice.repository.ChapterRepository;
import com.storyplatform.contentservice.repository.ContentRevisionRepository;
import com.storyplatform.contentservice.repository.StoryRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;
    private final StoryRepository storyRepository;
    private final ChapterProperties chapterProperties;
    private final ContentRevisionRepository revisionRepository;

    public ChapterServiceImpl(
            ChapterRepository chapterRepository,
            StoryRepository storyRepository,
            ChapterProperties chapterProperties,
            ContentRevisionRepository revisionRepository
    ) {
        this.chapterRepository = chapterRepository;
        this.storyRepository = storyRepository;
        this.chapterProperties = chapterProperties;
        this.revisionRepository = revisionRepository;
    }

    @Override
    public Chapter createChapter(Chapter chapter) {
        validateChapterContent(chapter.getTitle(), chapter.getContent());
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

        return saved;
    }

    @Override
    public Chapter editContent(
            String chapterId,
            String authorId,
            String title,
            String content,
            ContentFormat contentFormat,
            boolean publishImmediately
    ) {
        Chapter chapter = getDraftableById(chapterId);
        validateChapterContent(title, content);
    
        int nextRevisionNumber = revisionRepository
                .findFirstByParentIdAndParentTypeOrderByRevisionNumberDesc(
                        chapterId, ContentParentType.CHAPTER)
                .map(r -> r.getRevisionNumber() + 1)
                .orElse(1);
    
        ContentRevision revision = new ContentRevision(
                chapterId,
                ContentParentType.CHAPTER,
                nextRevisionNumber,
                title,
                content,
                contentFormat,
                authorId
        );
    
        // Decide whether this revision becomes the live version
        boolean shouldGoLive =
                chapter.getStatus() == ChapterStatus.DRAFT     // first publish via status change later
                || (chapter.getStatus() == ChapterStatus.PUBLISHED && publishImmediately);
    
        if (shouldGoLive) {
            revision.markPublished();
        }
    
        ContentRevision savedRevision = revisionRepository.save(revision);
    
        if (shouldGoLive) {
            // Flip pointer + denormalize content for fast reader reads
            chapter.setTitle(title);
            chapter.setContent(content);
            chapter.setContentFormat(contentFormat);
            chapter.setCurrentRevisionId(savedRevision.getId());
        }
        // For PUBLISHED chapters where publishImmediately = false:
        // revision is saved as a "pending edit", chapter content stays unchanged.
    
        return chapterRepository.save(chapter);
    }

    @Override
    public Chapter updateStatus(String chapterId, ChapterStatus status) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));

        ChapterStatus previous = chapter.getStatus();

        // no-op
        if (previous == status) {
            return chapter;
        }

        boolean allowed =
                (previous == ChapterStatus.DRAFT
                        && (status == ChapterStatus.PUBLISHED || status == ChapterStatus.ARCHIVED))
            || (previous == ChapterStatus.PUBLISHED
                        && status == ChapterStatus.ARCHIVED)
            || (previous == ChapterStatus.ARCHIVED
                        && status == ChapterStatus.PUBLISHED);

        if (!allowed) {
            throw new IllegalArgumentException(
                    "Invalid chapter status transition: " + previous + " -> " + status
            );
        }

        // validate publish
        if (status == ChapterStatus.PUBLISHED) {
            String c = chapter.getContent();
            if (c == null || c.trim().isEmpty()) {
                throw new IllegalArgumentException("Cannot publish an empty chapter");
            }
        }

        chapter.setStatus(status);
        Chapter saved = chapterRepository.save(chapter);

        // Story status automation (Phase 1): first publish flips story DRAFT -> ONGOING
        if (previous != ChapterStatus.PUBLISHED && status == ChapterStatus.PUBLISHED) {
            Story story = storyRepository.findById(saved.getStoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

            if (story.getStatus() == StoryStatus.DRAFT) {
                story.setStatus(StoryStatus.ONGOING);
                storyRepository.save(story);
            }
        }

        return saved;
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

    private void validateChapterContent(String title, String content) {

        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Chapter title is required");
        }

        if (title.length() > chapterProperties.getTitleMaxLength()) {
            throw new IllegalArgumentException("Chapter title exceeds max length");
        }

        if (content != null && content.length() > chapterProperties.getMaxLength()) {
            throw new IllegalArgumentException("Chapter content exceeds max length");
        }
    }

    @Override
    public Chapter publishRevision(String chapterId, String revisionId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));

        ContentRevision revision = revisionRepository.findById(revisionId)
                .orElseThrow(() -> new ResourceNotFoundException("Revision not found"));

        if (!revision.getParentId().equals(chapterId)
                || revision.getParentType() != ContentParentType.CHAPTER) {
            throw new IllegalArgumentException("Revision does not belong to this chapter");
        }

        // Atomicity caveat: between saving the revision and updating the chapter pointer, a crash leaves an orphan revision. For a single-user writer flow, this is acceptable for now. Later, we should wrap these in a Mongo transaction.

        revision.markPublished();
        revisionRepository.save(revision);

        chapter.setTitle(revision.getTitle());
        chapter.setContent(revision.getContent());
        chapter.setContentFormat(revision.getContentFormat());
        chapter.setCurrentRevisionId(revision.getId());

        return chapterRepository.save(chapter);
    }

    @Override
    public Page<ContentRevision> getChapterRevisions(String chapterId, Pageable pageable) {
        return revisionRepository.findByParentIdAndParentTypeOrderByRevisionNumberDesc(
                chapterId, ContentParentType.CHAPTER, pageable);
    }

}
