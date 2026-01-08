package com.audax.auth.service;

import com.audax.auth.domain.User;
import com.audax.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    public User signup(String email, String rawPassword) {
        repo.findByEmail(email).ifPresent(u -> { throw new IllegalArgumentException("Email already exists"); });

        User u = new User();
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(rawPassword));
        u.setRoles(List.of("ROLE_USER"));
        return repo.save(u);
    }

    public User verifyLogin(String email, String rawPassword) {
        User u = repo.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!encoder.matches(rawPassword, u.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return u;
    }
}
