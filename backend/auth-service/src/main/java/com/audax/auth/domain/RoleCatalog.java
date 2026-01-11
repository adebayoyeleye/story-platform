package com.audax.auth.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "role_catalog")
public class RoleCatalog {

    @Id
    private String id;

    @Indexed(unique = true)
    private String appId;

    private List<RoleMeta> roles;

    private Instant updatedAt;

    public static class RoleMeta {
        private String code;
        private String description;

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAppId() { return appId; }
    public void setAppId(String appId) { this.appId = appId; }

    public List<RoleMeta> getRoles() { return roles; }
    public void setRoles(List<RoleMeta> roles) { this.roles = roles; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
