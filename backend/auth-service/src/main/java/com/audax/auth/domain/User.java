package com.audax.auth.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Document(collection = "users")
public class User {

    @Id
    private String id = UUID.randomUUID().toString();

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    /**
     * Roles are scoped by app so they don't leak across products.
     * Example:
     *  {
     *    "storyapp": ["WRITER", "ADMIN"],
     *    "anotherapp": ["USER"]
     *  }
     */
    private Map<String, List<String>> rolesByApp;

    private Instant createdAt = Instant.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Map<String, List<String>> getRolesByApp() { return rolesByApp; }
    public void setRolesByApp(Map<String, List<String>> rolesByApp) { this.rolesByApp = rolesByApp; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
