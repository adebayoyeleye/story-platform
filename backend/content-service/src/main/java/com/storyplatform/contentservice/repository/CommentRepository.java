package com.storyplatform.contentservice.repository;

import com.storyplatform.contentservice.domain.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommentRepository
        extends MongoRepository<Comment, String> {

    Page<Comment> findByChapterId(
            String chapterId,
            Pageable pageable
    );
}
