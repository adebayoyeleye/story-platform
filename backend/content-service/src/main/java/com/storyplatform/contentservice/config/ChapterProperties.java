package com.storyplatform.contentservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "story.chapter")
public class ChapterProperties {

    private int maxLength;
    private int titleMaxLength;

    public int getMaxLength() { return maxLength; }
    public void setMaxLength(int maxLength) { this.maxLength = maxLength; }

    public int getTitleMaxLength() { return titleMaxLength; }
    public void setTitleMaxLength(int titleMaxLength) { this.titleMaxLength = titleMaxLength; }
}