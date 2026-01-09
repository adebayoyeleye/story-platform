package com.audax.auth.service;

import com.audax.auth.repository.RoleDefinitionRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RoleCatalogService {

    private final RoleDefinitionRepository roles;

    public RoleCatalogService(RoleDefinitionRepository roles) {
        this.roles = roles;
    }

    public void assertRolesExist(String appId, List<String> requestedRoles) {
        // fast path: build set of allowed role names for appId
        Set<String> allowed = new HashSet<>(roles.findByAppId(appId).stream().map(r -> r.getName()).toList());

        for (String r : requestedRoles) {
            if (!allowed.contains(r)) {
                throw new IllegalArgumentException("Unknown/invalid role for appId=" + appId + ": " + r);
            }
        }
    }
}
