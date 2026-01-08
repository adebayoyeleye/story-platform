package com.audax.auth.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
@EnableConfigurationProperties(JwtProps.class)
public class JwtKeyConfig {

    @Bean
    public RSAKey rsaKey(JwtProps props) {
        if (isBlank(props.privateKeyB64()) || isBlank(props.publicKeyB64())) {
            throw new IllegalStateException("JWT keys missing. Set JWT_PRIVATE_KEY_B64 and JWT_PUBLIC_KEY_B64");
        }

        RSAPrivateKey privateKey = parsePrivateKey(props.privateKeyB64());
        RSAPublicKey publicKey = parsePublicKey(props.publicKeyB64());

        return new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(props.keyId())
                .build();
    }

    @Bean
    public JwtEncoder jwtEncoder(RSAKey rsaKey) {
        JWKSource<SecurityContext> jwkSource = new ImmutableJWKSet<>(new JWKSet(rsaKey));
        return new NimbusJwtEncoder(jwkSource);
    }

    private RSAPrivateKey parsePrivateKey(String b64) {
        try {
            byte[] der = decodePem(b64, "PRIVATE KEY");
            return (RSAPrivateKey) KeyFactory.getInstance("RSA")
                    .generatePrivate(new PKCS8EncodedKeySpec(der));
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid JWT_PRIVATE_KEY_B64: ensure it is a base64-encoded PKCS#8 PEM", e);
        }
    }

    private RSAPublicKey parsePublicKey(String b64) {
        try {
            byte[] der = decodePem(b64, "PUBLIC KEY");
            return (RSAPublicKey) KeyFactory.getInstance("RSA")
                    .generatePublic(new X509EncodedKeySpec(der));
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid JWT_PUBLIC_KEY_B64: ensure it is a base64-encoded X.509 PEM", e);
        }
    }

    /**
     * Optimized helper to strip PEM headers and decode Base64 in one pass.
     */
    private byte[] decodePem(String b64, String type) {
        String pem = new String(Base64.getDecoder().decode(b64), StandardCharsets.UTF_8);
        String content = pem
                .replace("-----BEGIN " + type + "-----", "")
                .replace("-----END " + type + "-----", "")
                .replaceAll("\\s+", "");
        return Base64.getDecoder().decode(content);
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
