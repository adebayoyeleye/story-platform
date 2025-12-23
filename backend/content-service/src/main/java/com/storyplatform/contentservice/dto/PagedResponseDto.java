package com.storyplatform.contentservice.dto;

import java.util.List;

public class PagedResponseDto<T> {

    private final List<T> items;
    private final int page;
    private final int size;
    private final long totalItems;
    private final int totalPages;
    private final boolean last;

    public PagedResponseDto(
            List<T> items,
            int page,
            int size,
            long totalItems
    ) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.totalItems = totalItems;
        this.totalPages = (int) Math.ceil((double) totalItems / size);
        this.last = page >= totalPages - 1;
    }

    public List<T> getItems() { return items; }
    public int getPage() { return page; }
    public int getSize() { return size; }
    public long getTotalItems() { return totalItems; }
    public int getTotalPages() { return totalPages; }
    public boolean isLast() { return last; }
}
