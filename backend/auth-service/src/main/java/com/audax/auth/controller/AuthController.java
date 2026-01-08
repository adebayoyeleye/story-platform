package com.audax.auth.controller;

import com.audax.auth.dto.*;
import com.audax.auth.service.TokenService;
import com.audax.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService users;
    private final TokenService tokens;

    public AuthController(UserService users, TokenService tokens) {
        this.users = users;
        this.tokens = tokens;
    }

    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest req) {
        var user = users.signup(req.email(), req.password());
        return new AuthResponse(tokens.mint(user), "Bearer");
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        var user = users.verifyLogin(req.email(), req.password());
        return new AuthResponse(tokens.mint(user), "Bearer");
    }
}
