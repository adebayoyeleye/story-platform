package com.audax.auth.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

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
        var jwkSet = new JWKSet(rsaKey);
        var jwkSource = new ImmutableJWKSet<SecurityContext>(jwkSet);
        return new NimbusJwtEncoder(jwkSource);
    }

    private RSAPrivateKey parsePrivateKey(String b64Pem) {
        try {
            String pem = new String(Base64.getDecoder().decode(b64Pem));
            String cleaned = pem
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s+", "");
            byte[] der = Base64.getDecoder().decode(cleaned);
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(der);
            return (RSAPrivateKey) KeyFactory.getInstance("RSA").generatePrivate(spec);
        } catch (Exception e) {
            throw new IllegalStateException("Invalid JWT_PRIVATE_KEY_B64 (must be base64 of PEM)", e);
        }
    }

    private RSAPublicKey parsePublicKey(String b64Pem) {
        try {
            String pem = new String(Base64.getDecoder().decode(b64Pem));
            String cleaned = pem
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s+", "");
            byte[] der = Base64.getDecoder().decode(cleaned);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(der);
            return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(spec);
        } catch (Exception e) {
            throw new IllegalStateException("Invalid JWT_PUBLIC_KEY_B64 (must be base64 of PEM)", e);
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
