package com.audax.auth.service;

import com.audax.auth.domain.User;
import com.audax.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final RoleCatalogService roleCatalog;

    public UserService(UserRepository repo, PasswordEncoder encoder, RoleCatalogService roleCatalog) {
        this.repo = repo;
        this.encoder = encoder;
        this.roleCatalog = roleCatalog;
    }

    public User signup(String email, String rawPassword, String appId, List<String> roles) {
        repo.findByEmail(email).ifPresent(u -> { throw new IllegalArgumentException("Email already exists"); });

        // validate roles exist in DB for this appId (no redeploy needed to add roles)
        var safeRoles = (roles == null) ? List.<String>of() : roles;
        roleCatalog.assertRolesExist(appId, safeRoles);

        User u = new User();
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(rawPassword));

        var rolesByApp = new HashMap<String, List<String>>();
        rolesByApp.put(appId, safeRoles);
        u.setRolesByApp(rolesByApp);

        return repo.save(u);
    }

    public User verifyLogin(String email, String rawPassword) {
        User u = repo.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!encoder.matches(rawPassword, u.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return u;
    }

    public User verifyLoginById(String userId) {
        return repo.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
