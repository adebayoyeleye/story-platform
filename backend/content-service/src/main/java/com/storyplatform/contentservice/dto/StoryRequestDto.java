package com.storyplatform.contentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record StoryRequestDto(

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    String title,

    @NotBlank(message = "Author is required")
    @Size(max = 100)
    String author,

    @Size(max = 500)
    String synopsis,

    List<ChapterDto> chapters
) {}
