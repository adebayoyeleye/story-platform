package com.storyplatform.contentservice.service;

import com.storyplatform.contentservice.domain.ContributorRole;
import com.storyplatform.contentservice.domain.Story;
import com.storyplatform.contentservice.domain.StoryContributor;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public final class BylineBuilder {
    private BylineBuilder() {}

    public static String build(Story story) {
        // byline should reflect OWNER + CO_AUTHOR (not editors)
        List<String> names = story.getContributors().stream()
                .filter(c -> c.getRole() == ContributorRole.OWNER || c.getRole() == ContributorRole.CO_AUTHOR)
                .sorted(Comparator
                        .comparing((StoryContributor c) -> c.getRole() == ContributorRole.OWNER ? 0 : 1)
                        .thenComparing(StoryContributor::getAddedAt))
                .map(c -> (c.getPenName() == null || c.getPenName().isBlank()) ? c.getUserId() : c.getPenName())
                .collect(Collectors.toList());

        if (names.isEmpty()) {
            // fallback for legacy stories
            return story.getAuthorId() == null ? "Unknown" : story.getAuthorId();
        }

        if (names.size() == 1) return names.get(0);
        if (names.size() == 2) return names.get(0) + " & " + names.get(1);

        return String.join(", ", names.subList(0, names.size() - 1)) + " & " + names.get(names.size() - 1);
    }
}
