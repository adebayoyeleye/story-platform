package com.storyplatform.contentservice.dto;

import java.util.List;

public record StoryResponseDto(
    String id,
    String title,
    String author,
    String synopsis,
    List<ChapterDto> chapters
) {}
