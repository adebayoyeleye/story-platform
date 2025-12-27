package com.storyplatform.contentservice.dto;

import java.time.Instant;
import java.util.Map;

public record ApiErrorResponseDto(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors
) {}
