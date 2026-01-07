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
        repo.findByEmail(email).ifPresent(u -> {
            throw new IllegalArgumentException("Email already exists");
        });

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(rawPassword));
        user.setRoles(List.of("WRITER"));

        return repo.save(user);
    }

    public User authenticate(String email, String rawPassword) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!encoder.matches(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return user;
    }
}
