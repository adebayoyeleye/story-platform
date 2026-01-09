package com.storyplatform.contentservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;

import java.util.List;

@Configuration
public class SecurityConfig {

  // IMPORTANT: this must match the appId you issue tokens for
  private static final String APP_ID = "storyapp";

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable());

    http.authorizeHttpRequests(auth -> auth
        // public endpoints
        .requestMatchers("/api/v1/stories/**", "/api/v1/chapters/**").permitAll()

        // protected endpoints
        .requestMatchers("/api/v1/admin/**").authenticated()

        .anyRequest().permitAll()
    );

    http.oauth2ResourceServer(oauth2 -> oauth2
        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter()))
    );

    return http.build();
  }

  /**
   * Converts JWT -> Authentication.
   * - Enforces audience contains our APP_ID (prevents cross-app token leakage)
   * - Converts roles ["WRITER","ADMIN"] -> authorities ["ROLE_WRITER","ROLE_ADMIN"]
   */
  @Bean
  Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthConverter() {
    return jwt -> {
      // 1) enforce app scoping
      if (jwt.getAudience() == null || !jwt.getAudience().contains(APP_ID)) {
        throw new org.springframework.security.oauth2.jwt.JwtException("Invalid token audience");
      }

      // 2) roles claim -> authorities
      List<String> roles = jwt.getClaimAsStringList("roles");
      var authorities = (roles == null ? List.<String>of() : roles).stream()
          .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
          .map(SimpleGrantedAuthority::new)
          .toList();

      return new JwtAuthenticationToken(jwt, authorities);
    };
  }
}
