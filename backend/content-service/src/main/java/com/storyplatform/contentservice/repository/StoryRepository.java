package com.storyplatform.contentservice.repository;

import com.storyplatform.contentservice.domain.Story;
import com.storyplatform.contentservice.domain.StoryStatus;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StoryRepository extends MongoRepository<Story, String> {

    Page<Story> findByStatus(StoryStatus status, Pageable pageable);

    Page<Story> findByAuthorId(String authorId, Pageable pageable);

    Page<Story> findByAuthorIdAndStatus(
            String authorId,
            StoryStatus status,
            Pageable pageable
    );

    Page<Story> findByStatusIn(List<StoryStatus> statuses, Pageable pageable);

}
