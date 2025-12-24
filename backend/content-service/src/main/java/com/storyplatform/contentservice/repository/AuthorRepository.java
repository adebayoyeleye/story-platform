package com.storyplatform.contentservice.repository;

import com.storyplatform.contentservice.domain.Author;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AuthorRepository extends MongoRepository<Author, String> {

    Optional<Author> findByDisplayName(String displayName);
}
