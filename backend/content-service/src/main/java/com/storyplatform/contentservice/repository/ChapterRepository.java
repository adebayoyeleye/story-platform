package com.storyplatform.contentservice.repository;

import com.storyplatform.contentservice.domain.Chapter;
import com.storyplatform.contentservice.domain.ChapterStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChapterRepository extends MongoRepository<Chapter, String> {

    Page<Chapter> findByStoryId(
            String storyId,
            Pageable pageable
    );

    Page<Chapter> findByStoryIdAndStatus(
            String storyId,
            ChapterStatus status,
            Pageable pageable
    );
}
