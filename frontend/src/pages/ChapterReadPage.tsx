import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { apiGet } from "@/api/http"
import type { Chapter, ChapterSummary, StorySummary } from "@/types"
import { setContinueReading } from "@/features/reader/continueReading"
import { usePageView } from "@/hooks/usePageView"
import { ReadingShell } from "@/features/reader/components/ReadingShell"
import { ReadingHeader } from "@/features/reader/components/ReadingHeader"
import { ChapterPager } from "@/features/reader/components/ChapterPager"
import { RichTextContent } from "@/features/reader/components/RichTextContent"
import { approxReadMinutes, approxWordCount } from "@/lib/text"

type Nav = { prev?: ChapterSummary; next?: ChapterSummary; current: number; total: number }

const NUM_TO_WORD = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]

function chapterWord(n: number): string {
  return NUM_TO_WORD[n] ?? String(n)
}

export default function ChapterReadPage() {
  const { chapterId } = useParams()
  usePageView(chapterId, "CHAPTER")

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [story, setStory] = useState<StorySummary | null>(null)
  const [nav, setNav] = useState<Nav | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chapterId) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      setNav(null)

      try {
        const data = await apiGet<Chapter>(`/api/v1/content/chapters/${chapterId}`)
        if (cancelled) return
        setChapter(data)

        setContinueReading(data.storyId, {
          chapterId: data.id,
          chapterTitle: data.title,
          chapterNumber: (data as { chapterNumber?: number }).chapterNumber,
        })

        // Parent story (for back link + byline). Failure here is non-fatal —
        // a chapter without its parent loaded should still render.
        apiGet<StorySummary>(`/api/v1/content/stories/${data.storyId}`)
          .then((s) => { if (!cancelled) setStory(s) })
          .catch(() => { /* leave story null */ })

        // Sibling chapters for prev/next nav
        const page = await apiGet<{ content?: ChapterSummary[] }>(
          `/api/v1/content/stories/${data.storyId}/chapters?page=0&size=500`
        )
        if (cancelled) return

        const list = (page.content ?? []).slice().sort(
          (a, b) => a.chapterNumber - b.chapterNumber
        )
        const idx = list.findIndex((c) => c.id === data.id)
        setNav({
          prev: idx > 0 ? list[idx - 1] : undefined,
          next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined,
          current: idx + 1,
          total: list.length,
        })
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load chapter")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [chapterId])

  const meta = useMemo(() => {
    if (!chapter) return []
    const words = approxWordCount(chapter.content)
    const mins = approxReadMinutes(words)
    return [`${mins} min read`]
  }, [chapter])

  if (loading) {
    return (
      <ReadingShell backHref="/" backLabel="Library">
        <div className="text-muted-foreground">Loading chapter…</div>
      </ReadingShell>
    )
  }
  if (error) {
    return (
      <ReadingShell backHref="/" backLabel="Library">
        <div className="text-error" role="alert">{error}</div>
      </ReadingShell>
    )
  }
  if (!chapter) {
    return (
      <ReadingShell backHref="/" backLabel="Library">
        <div>Chapter not found.</div>
      </ReadingShell>
    )
  }

  const chapterNumber = (chapter as { chapterNumber?: number }).chapterNumber
  const eyebrow = chapterNumber ? `Chapter ${chapterWord(chapterNumber)}` : undefined
  const topEyebrow = nav ? `Ch. ${nav.current} of ${nav.total}` : undefined

  return (
    <ReadingShell
      backHref={`/stories/${chapter.storyId}`}
      backLabel={story?.title ?? "Back"}
      eyebrow={topEyebrow}
      bottomNav={nav ? <ChapterPager nav={nav} /> : null}
    >
      <ReadingHeader
        contentType="STORY_WITH_CHAPTERS"
        eyebrow={eyebrow}
        title={chapter.title}
        byline={story?.byline}
        metaParts={meta}
      />

      {chapter.contentFormat === "RICH_TEXT_HTML" ? (
        <RichTextContent html={chapter.content} />
      ) : (
        <div className="story-richtext whitespace-pre-wrap">{chapter.content}</div>
      )}
    </ReadingShell>
  )
}