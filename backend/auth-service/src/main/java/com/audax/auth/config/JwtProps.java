package com.audax.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public record JwtProps(
        String issuer,
        String keyId,
        String privateKeyB64,
        String publicKeyB64
) {}
