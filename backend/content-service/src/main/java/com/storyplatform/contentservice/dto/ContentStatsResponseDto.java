package com.storyplatform.contentservice.dto;

public record ContentStatsResponseDto(
        long total,
        long last24Hours,
        long last7Days,
        long last30Days
) {}
