import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { apiGet } from "@/api/http"
import type { Chapter, ChapterSummary, ContentType, StorySummary } from "@/types"
import { usePageView } from "@/hooks/usePageView"
import { ReadingShell } from "@/features/reader/components/ReadingShell"
import { ReadingHeader } from "@/features/reader/components/ReadingHeader"
import { PoemBody } from "@/features/reader/components/PoemBody"
import { RichTextContent } from "@/features/reader/components/RichTextContent"
import {
  approxLineCount,
  approxReadMinutes,
  approxWordCount,
} from "@/lib/text"
import { CONTENT_TYPE_META } from "@/lib/contentType"

/**
 * Read page for non-chaptered works: SHORT_STORY, ARTICLE, POEM.
 *
 * Backed by a story id rather than a chapter id (the URL the reader sees
 * is /stories/:storyId/read). Internally we still fetch the synthetic
 * single chapter that holds the body; that's an implementation detail.
 *
 * Branches on contentType only for body rendering (poem wants
 * preserve-whitespace + narrower column) and meta-row composition.
 */
export default function StandaloneReadPage() {
  const { storyId } = useParams()

  const [story, setStory] = useState<StorySummary | null>(null)
  const [body, setBody] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Record the view against the chapter id once we know it, matching
  // the analytics shape used by chapter-paged works.
  usePageView(body?.id, "CHAPTER")

  useEffect(() => {
    if (!storyId) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)

      try {
        const [storyData, chaptersPage] = await Promise.all([
          apiGet<StorySummary>(`/api/v1/content/stories/${storyId}`),
          apiGet<{ content?: ChapterSummary[] }>(
            `/api/v1/content/stories/${storyId}/chapters?page=0&size=1`
          ),
        ])
        if (cancelled) return
        setStory(storyData)

        const first = chaptersPage.content?.[0]
        if (!first) {
          setError("This work has no body yet.")
          setLoading(false)
          return
        }

        const chapterData = await apiGet<Chapter>(
          `/api/v1/content/chapters/${first.id}`
        )
        if (cancelled) return
        setBody(chapterData)
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [storyId])

  const meta = useMemo(() => {
    if (!body || !story) return []
    return composeMeta(story.contentType, body.content)
  }, [body, story])

  if (loading) {
    return (
      <ReadingShell backHref="/" backLabel="Library">
        <div className="text-muted-foreground">Loading…</div>
      </ReadingShell>
    )
  }
  if (error || !story || !body) {
    return (
      <ReadingShell backHref="/" backLabel="Library">
        <div className="text-error" role="alert">
          {error ?? "Not found."}
        </div>
      </ReadingShell>
    )
  }

  const isPoem = story.contentType === "POEM"
  const backLabel = CONTENT_TYPE_META[story.contentType].label + "s"

  return (
    <ReadingShell
      backHref={`/discover/${story.contentType.toLowerCase()}`}
      backLabel={backLabel}
      width={isPoem ? "narrow" : "default"}
    >
      <ReadingHeader
        contentType={story.contentType}
        title={story.title}
        byline={story.byline}
        metaParts={meta}
      />

      {isPoem ? (
        <PoemBody html={body.content} />
      ) : body.contentFormat === "RICH_TEXT_HTML" ? (
        <RichTextContent html={body.content} />
      ) : (
        <div className="story-richtext whitespace-pre-wrap">{body.content}</div>
      )}
    </ReadingShell>
  )
}

/**
 * Per design doc §4.1 / §4.2 — each type surfaces different signals.
 * Centralised here so the rest of the component reads cleanly.
 */
function composeMeta(type: ContentType, html: string): string[] {
  switch (type) {
    case "SHORT_STORY":
    case "ARTICLE": {
      const words = approxWordCount(html)
      const mins = approxReadMinutes(words)
      return [`${mins} min read`, `${words.toLocaleString()} words`]
    }
    case "POEM": {
      const lines = approxLineCount(html)
      return lines > 0 ? [`${lines} line${lines === 1 ? "" : "s"}`] : []
    }
    case "STORY_WITH_CHAPTERS":
      return [] // not used here, but TS exhaustiveness needs it
  }
}