package com.storyplatform.contentservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable());

    http.authorizeHttpRequests(auth -> auth
        // public endpoints
        .requestMatchers("/api/v1/stories/**", "/api/v1/chapters/**").permitAll()

        // admin/writer endpoints (your current paths)
        .requestMatchers("/api/v1/admin/**").authenticated()

        .anyRequest().permitAll()
    );

    http.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
    return http.build();
  }
}
