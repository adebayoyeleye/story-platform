package com.audax.auth.controller;

import com.audax.auth.dto.*;
import com.audax.auth.service.RefreshTokenService;
import com.audax.auth.service.TokenService;
import com.audax.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService users;
    private final TokenService tokens;
    private final RefreshTokenService refreshTokens;

    public AuthController(UserService users, TokenService tokens, RefreshTokenService refreshTokens) {
        this.users = users;
        this.tokens = tokens;
        this.refreshTokens = refreshTokens;
    }

    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest req) {
        var user = users.signup(req.email(), req.password(), req.appId(), req.roles());

        var access = tokens.mintAccess(user, req.appId());
        var refresh = refreshTokens.mint(user.getId(), req.appId());

        return new AuthResponse(
                access.token(),
                refresh.rawToken(),
                "Bearer",
                access.expiresInSeconds(),
                tokens.issuer()
        );
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        var user = users.verifyLogin(req.email(), req.password());

        var access = tokens.mintAccess(user, req.appId());
        var refresh = refreshTokens.mint(user.getId(), req.appId());

        return new AuthResponse(
                access.token(),
                refresh.rawToken(),
                "Bearer",
                access.expiresInSeconds(),
                tokens.issuer()
        );
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest req) {
        var rt = refreshTokens.verify(req.refreshToken());

        // rotate: revoke old refresh and issue a new one
        refreshTokens.revoke(rt);
        var newRefresh = refreshTokens.mint(rt.getUserId(), rt.getAppId());

        // mint new access token for the same appId
        // NOTE: load user to pull app-scoped roles for that app
        var user = users.verifyLoginById(rt.getUserId()); // add method below
        var access = tokens.mintAccess(user, rt.getAppId());

        return new AuthResponse(
                access.token(),
                newRefresh.rawToken(),
                "Bearer",
                access.expiresInSeconds(),
                tokens.issuer()
        );
    }
}
