package com.audax.auth.service;

import com.audax.auth.config.JwtProps;
import com.audax.auth.domain.User;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class TokenService {

    private final JwtEncoder encoder;
    private final JwtProps props;

    public TokenService(JwtEncoder encoder, JwtProps props) {
        this.encoder = encoder;
        this.props = props;
    }

    public String mint(User user) {
        Instant now = Instant.now();
        Instant exp = now.plus(2, ChronoUnit.HOURS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(props.issuer())
                .issuedAt(now)
                .expiresAt(exp)
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("roles", user.getRoles())
                .build();

        JwsHeader headers = JwsHeader.with(() -> "RS256")
                .keyId(props.keyId())
                .build();

        return encoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
    }
}
