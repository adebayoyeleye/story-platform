package com.audax.auth.repository;

import com.audax.auth.domain.RoleDefinition;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RoleDefinitionRepository extends MongoRepository<RoleDefinition, String> {
    Optional<RoleDefinition> findByName(String name);
    List<RoleDefinition> findByAppId(String appId);
}
