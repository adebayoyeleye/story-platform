package com.audax.auth.service;

import com.audax.auth.config.JwtProps;
import com.audax.auth.domain.RefreshToken;
import com.audax.auth.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repo;
    private final JwtProps props;

    public RefreshTokenService(RefreshTokenRepository repo, JwtProps props) {
        this.repo = repo;
        this.props = props;
    }

    public record MintedRefreshToken(String rawToken, RefreshToken saved) {}

    public MintedRefreshToken mint(String userId, String appId) {
        String raw = UUID.randomUUID().toString() + "." + UUID.randomUUID(); // simple, unpredictable enough for now
        String hash = sha256Base64(raw);

        RefreshToken rt = new RefreshToken();
        rt.setUserId(userId);
        rt.setAppId(appId);
        rt.setTokenHash(hash);
        rt.setExpiresAt(Instant.now().plus(props.refreshTokenTtl()));
        rt.setRevoked(false);

        return new MintedRefreshToken(raw, repo.save(rt));
    }

    public RefreshToken verify(String rawToken) {
        String hash = sha256Base64(rawToken);
        RefreshToken rt = repo.findByTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (rt.isRevoked()) throw new IllegalArgumentException("Refresh token revoked");
        if (rt.getExpiresAt().isBefore(Instant.now())) throw new IllegalArgumentException("Refresh token expired");
        return rt;
    }

    public void revoke(RefreshToken rt) {
        rt.setRevoked(true);
        repo.save(rt);
    }

    private static String sha256Base64(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(s.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
