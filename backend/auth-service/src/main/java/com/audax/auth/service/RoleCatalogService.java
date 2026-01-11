package com.audax.auth.service;

import com.audax.auth.repository.RoleCatalogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoleCatalogService {

    private final RoleCatalogRepository repo;

    public RoleCatalogService(RoleCatalogRepository repo) {
        this.repo = repo;
    }

    public void assertRolesExist(String appId, List<String> roles) {
        if (roles == null || roles.isEmpty()) return;

        var catalog = repo.findByAppId(appId)
                .orElseThrow(() -> new IllegalArgumentException("No role catalog found for appId=" + appId));

        Set<String> allowed = catalog.getRoles() == null ? Set.of() :
                catalog.getRoles().stream()
                        .map(r -> r.getCode())
                        .collect(Collectors.toSet());

        for (String role : roles) {
            if (!allowed.contains(role)) {
                throw new IllegalArgumentException("Unknown/invalid role for appId=" + appId + ": " + role);
            }
        }
    }
}
