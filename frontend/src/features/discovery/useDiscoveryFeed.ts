import { useEffect, useMemo, useState } from "react"
import { apiGet } from "@/api/http"
import type { ContentType, StorySummary } from "@/types"

type Bucket = StorySummary[]

export type DiscoveryFeed = {
  loading: boolean
  error: string | null
  byType: Record<ContentType, Bucket>
  all: StorySummary[]
}

const EMPTY: DiscoveryFeed = {
  loading: true,
  error: null,
  byType: {
    STORY_WITH_CHAPTERS: [],
    SHORT_STORY: [],
    ARTICLE: [],
    POEM: [],
  },
  all: [],
}

/**
 * Homepage data: one page of public stories, partitioned by content type.
 *
 * Client-side partitioning is a deliberate choice for Phase 1 — see
 * BACKLOG entry P-LANE-API for when this needs server support.
 */
export function useDiscoveryFeed(pageSize = 40): DiscoveryFeed {
  const [feed, setFeed] = useState<DiscoveryFeed>(EMPTY)

  useEffect(() => {
    let cancelled = false

    apiGet<{ content?: StorySummary[] }>(
      `/api/v1/content/stories?page=0&size=${pageSize}`
    )
      .then((page) => {
        if (cancelled) return
        const all = page.content ?? []
        const byType: Record<ContentType, Bucket> = {
          STORY_WITH_CHAPTERS: [],
          SHORT_STORY: [],
          ARTICLE: [],
          POEM: [],
        }
        for (const s of all) {
          byType[s.contentType].push(s)
        }
        setFeed({ loading: false, error: null, byType, all })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setFeed({
          ...EMPTY,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load stories",
        })
      })

    return () => {
      cancelled = true
    }
  }, [pageSize])

  return feed
}


/**
 * Same data as useDiscoveryFeed, narrowed to one content type.
 * Use on /discover/:type pages — we don't want the homepage paying for
 * a re-fetch and we don't want the type page paying for partitioning
 * stories it'll never show.
 */
export function useTypeFeed(
  type: ContentType,
  pageSize = 60
): {
  loading: boolean
  error: string | null
  stories: StorySummary[]
} {
  const feed = useDiscoveryFeed(pageSize)
  const stories = useMemo(() => feed.byType[type], [feed.byType, type])
  return { loading: feed.loading, error: feed.error, stories }
}