package com.storyplatform.contentservice.repository;

import com.storyplatform.contentservice.model.Story;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StoryRepository
        extends MongoRepository<Story, String> {

    Page<Story> findAll(Pageable pageable);
}
