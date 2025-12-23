package com.storyplatform.contentservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class PageRequestDto {

    @Min(0)
    private int page = 0;

    @Min(1)
    @Max(100)
    private int size = 20;

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }
}
