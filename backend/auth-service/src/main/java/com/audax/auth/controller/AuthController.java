package com.audax.auth.controller;

import com.audax.auth.dto.LoginRequest;
import com.audax.auth.dto.SignupRequest;
import com.audax.auth.domain.User;
import com.audax.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService users;

    public AuthController(UserService users) {
        this.users = users;
    }

    @PostMapping("/signup")
    public Map<String, String> signup(@Valid @RequestBody SignupRequest req) {
        User u = users.signup(req.email(), req.password());
        return Map.of("userId", u.getId());
    }

    @PostMapping("/login")
    public Map<String, String> login(@Valid @RequestBody LoginRequest req) {
        User u = users.authenticate(req.email(), req.password());
        return Map.of("userId", u.getId());
    }
}
