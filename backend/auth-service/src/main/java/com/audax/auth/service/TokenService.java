package com.audax.auth.service;

import com.audax.auth.config.JwtProps;
import com.audax.auth.domain.User;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TokenService {

    private final JwtEncoder encoder;
    private final JwtProps props;

    public TokenService(JwtEncoder encoder, JwtProps props) {
        this.encoder = encoder;
        this.props = props;
    }

    public record MintedAccessToken(String token, long expiresInSeconds) {}

    public MintedAccessToken mintAccess(User user, String appId) {
        Instant now = Instant.now();
        Instant exp = now.plus(props.accessTokenTtl());

        List<String> appRoles =
                user.getRolesByApp() == null ? List.of() :
                        user.getRolesByApp().getOrDefault(appId, List.of());

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(props.issuer())
                .issuedAt(now)
                .expiresAt(exp)
                .subject(user.getId())
                .audience(List.of(appId))             // prevents role leakage across apps
                .claim("email", user.getEmail())
                .claim("roles", appRoles)             // only roles for THIS app
                .build();

        JwsHeader headers = JwsHeader.with(() -> "RS256")
                .keyId(props.keyId())
                .build();

        String token = encoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
        long expiresInSeconds = props.accessTokenTtl().toSeconds();
        return new MintedAccessToken(token, expiresInSeconds);
    }

    public String issuer() {
        return props.issuer();
    }
}
