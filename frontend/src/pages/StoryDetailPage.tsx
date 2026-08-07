import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLink as Link } from "@/components/AppLink"
import { apiGet } from "@/api/http"
import type { StorySummary, ChapterSummary } from "@/types"
import { AppShell } from "@/components/layout/AppShell"
import { Container } from "@/components/layout/Container"
import { Button } from "@/components/ui/Button"
import { CoverImage } from "@/components/CoverImage"
import { UserAvatar } from "@/components/Avatar"
import { TypeBadge } from "@/components/TypeBadge"
import {
  clearContinueReading,
  getContinueReading,
} from "@/features/reader/continueReading"
import { usePageView } from "@/hooks/usePageView"
import { STATUS_LABEL } from "@/lib/contentType"
import { cn } from "@/lib/cn"

export default function StoryDetailPage() {
  const { storyId } = useParams()
  const nav = useNavigate()
  usePageView(storyId, "STORY")

  const [story, setStory] = useState<StorySummary | null>(null)
  const [chapters, setChapters] = useState<ChapterSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chapterPage, setChapterPage] = useState(0)
  const [chaptersHasNext, setChaptersHasNext] = useState(false)

  const [continueReading, setContinueReadingState] = useState<
    ReturnType<typeof getContinueReading>
  >(null)

  useEffect(() => {
    if (!storyId) return
    setContinueReadingState(getContinueReading(storyId))
  }, [storyId, chapterPage, story?.id])

  // Standalone works don't have a detail page — redirect to read.
  useEffect(() => {
    if (!story) return
    if (story.contentType !== "STORY_WITH_CHAPTERS") {
      nav(`/stories/${story.id}/read`, { replace: true })
    }
  }, [story, nav])

  const sortedChapters = useMemo(
    () =>
      chapters
        .slice()
        .sort((a, b) => a.chapterNumber - b.chapterNumber),
    [chapters]
  )

  const firstChapter = sortedChapters[0] ?? null

  useEffect(() => {
    if (!storyId) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)

      try {
        const storyData = await apiGet<StorySummary>(
          `/api/v1/content/stories/${storyId}`
        )
        const chaptersData = await apiGet<{
          content?: ChapterSummary[]
          last?: boolean
        }>(`/api/v1/content/stories/${storyId}/chapters?page=${chapterPage}&size=50`)

        if (cancelled) return

        setStory(storyData)
        setChapters(chaptersData.content ?? [])
        setChaptersHasNext(chaptersData.last === false)
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [storyId, chapterPage])

  if (loading) {
    return (
      <AppShell>
        <Container className="py-12 text-muted-foreground">Loading…</Container>
      </AppShell>
    )
  }
  if (error || !story) {
    return (
      <AppShell>
        <Container className="py-12 text-error" role="alert">
          {error ?? "Story not found."}
        </Container>
      </AppShell>
    )
  }

  const bylineName = story.byline ?? "Anonymous"

  return (
    <AppShell>
      <Container className="py-8 md:py-12">
        <div className="grid gap-10 md:grid-cols-[260px_minmax(0,1fr)] items-start">
          {/* Left: cover + actions */}
          <div className="md:sticky md:top-20 space-y-4">
            <CoverImage
              seed={story.id}
              title={story.title}
              className="aspect-[3/4] w-full max-w-[260px]"
            />

            <div className="flex flex-col gap-2 max-w-[260px]">
              {continueReading?.chapterId ? (
                <Link to={`/chapters/${continueReading.chapterId}`}>
                  <Button className="w-full">
                    Continue at Ch. {continueReading.chapterNumber ?? "?"}
                  </Button>
                </Link>
              ) : firstChapter ? (
                <Link to={`/chapters/${firstChapter.id}`}>
                  <Button className="w-full">Start reading</Button>
                </Link>
              ) : (
                <Button className="w-full" disabled>
                  No chapters yet
                </Button>
              )}

              {continueReading && (
                <button
                  onClick={() => {
                    clearContinueReading(story.id)
                    setContinueReadingState(null)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground self-start"
                >
                  Clear progress
                </button>
              )}
            </div>
          </div>

          {/* Right: meta + chapters */}
          <div className="min-w-0">
            <TypeBadge type={story.contentType} className="mb-4" />

            <h1 className="font-serif font-semibold text-4xl md:text-5xl tracking-tight leading-tight mb-4">
              {story.title}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <UserAvatar seed={bylineName} name={bylineName} size="md" />
              <div>
                <div className="text-sm font-medium">by {bylineName}</div>
                <div className="text-xs text-muted-foreground">
                  {STATUS_LABEL[story.status]}
                </div>
              </div>
            </div>

            {story.synopsis && (
              <p className="font-serif text-lg leading-relaxed text-foreground mb-10 max-w-xl">
                {story.synopsis}
              </p>
            )}

            <div className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-3">
              Chapters
            </div>

            {sortedChapters.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No chapters published yet.
              </p>
            ) : (
              <ChapterList chapters={sortedChapters} />
            )}

            {(chapterPage > 0 || chaptersHasNext) && (
              <div className="flex gap-2 mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={chapterPage === 0}
                  onClick={() => setChapterPage((p) => Math.max(0, p - 1))}
                >
                  ← Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!chaptersHasNext}
                  onClick={() => setChapterPage((p) => p + 1)}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </AppShell>
  )
}

function ChapterList({ chapters }: { chapters: ChapterSummary[] }) {
  return (
    <ol className="divide-y divide-border border-t border-border">
      {chapters.map((c) => (
        <li key={c.id}>
          <Link
            to={`/chapters/${c.id}`}
            className={cn(
              "grid grid-cols-[2rem_1fr_auto] items-center gap-4 py-3",
              "hover:bg-surface-muted/50 transition-colors -mx-2 px-2 rounded",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <span className="font-mono text-xs text-muted-foreground">
              {String(c.chapterNumber).padStart(2, "0")}
            </span>
            <span className="font-serif text-base truncate">{c.title}</span>
            <span className="text-xs text-muted-foreground" aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}