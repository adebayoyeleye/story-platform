package com.storyplatform.contentservice.dto;

public record UpdateStoryMetaRequestDto(
        String title,
        String synopsis,
        String ownerPenName // optional: changes OWNER's pen name
) {}
