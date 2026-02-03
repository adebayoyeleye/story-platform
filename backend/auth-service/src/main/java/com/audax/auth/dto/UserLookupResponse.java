package com.audax.auth.dto;

public record UserLookupResponse(
        String id,
        String email,
        String displayName
) {}
