package com.audax.auth.repository;

import com.audax.auth.domain.RoleCatalog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RoleCatalogRepository extends MongoRepository<RoleCatalog, String> {
    Optional<RoleCatalog> findByAppId(String appId);
}