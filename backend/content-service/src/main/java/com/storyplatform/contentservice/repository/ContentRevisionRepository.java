package com.storyplatform.contentservice.repository;

import com.storyplatform.contentservice.domain.ContentParentType;
import com.storyplatform.contentservice.domain.ContentRevision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ContentRevisionRepository extends MongoRepository<ContentRevision, String> {

    Page<ContentRevision> findByParentIdAndParentTypeOrderByRevisionNumberDesc(
            String parentId, ContentParentType parentType, Pageable pageable);

    Optional<ContentRevision> findFirstByParentIdAndParentTypeOrderByRevisionNumberDesc(
            String parentId, ContentParentType parentType);
}