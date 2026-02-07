import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { apiGet } from "@/api/http"
import type { StorySummary, ChapterSummary } from "@/types"
import { Container } from "@/components/layout/Container"
import { Button } from "@/components/ui/Button"
import { clearContinueReading, getContinueReading } from "@/features/reader/continueReading"

export default function StoryDetailPage() {
  const { storyId } = useParams()
  const [story, setStory] = useState<StorySummary | null>(null)
  const [chapters, setChapters] = useState<ChapterSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chapterPage, setChapterPage] = useState(0)
  const [chaptersHasNext, setChaptersHasNext] = useState(false)

  const [continueReading, setContinueReadingState] = useState<ReturnType<typeof getContinueReading>>(null)

  useEffect(() => {
    if (!storyId) return
    setContinueReadingState(getContinueReading(storyId))
  }, [storyId, chapterPage, story?.id]) // safe: refresh when story loads / page changes

  const firstChapter = useMemo(() => {
    if (!chapters?.length) return null
    return chapters.slice().sort((a, b) => a.chapterNumber - b.chapterNumber)[0]
  }, [chapters])
    

  useEffect(() => {
    if (!storyId) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)

      try {
        const storyData = await apiGet<StorySummary>(`/api/v1/content/stories/${storyId}`)
        const chaptersData = await apiGet<any>(
          `/api/v1/content/stories/${storyId}/chapters?page=${chapterPage}&size=50`
        )

        if (cancelled) return

        setStory(storyData)
        setChapters(chaptersData.content ?? [])
        setChaptersHasNext(chaptersData?.last === false)
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load story")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [storyId, chapterPage])

  const sortedChapters = useMemo(() => {
    return chapters.slice().sort((a, b) => a.chapterNumber - b.chapterNumber)
  }, [chapters])

  // const firstChapter = sortedChapters[0]

  if (loading) return <Container>Loading story…</Container>
  if (error) return <Container className="text-red-600">{error}</Container>
  if (!story) return <Container>Story not found.</Container>

  return (
    <Container className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Back to Library
        </Link>

        {/* {firstChapter && (
          <Link to={`/chapters/${firstChapter.id}`}>
            <Button variant="secondary" type="button">
              Start reading
            </Button>
          </Link>
        )} */}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {continueReading?.chapterId ? (
            <>
              <Link to={`/chapters/${continueReading.chapterId}`}>
                <Button variant="secondary" type="button">
                  Continue reading
                  {continueReading.chapterTitle ? `: ${continueReading.chapterTitle}` : ""}
                </Button>
              </Link>

              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  if (!storyId) return
                  clearContinueReading(storyId)
                  setContinueReadingState(null)
                }}
              >
                Clear
              </Button>
            </>
          ) : (
            <Link to={firstChapter ? `/chapters/${firstChapter.id}` : "#"}>
              <Button variant="secondary" type="button" disabled={!firstChapter}>
                {firstChapter ? "Start reading" : "No chapters yet"}
              </Button>
            </Link>
          )}
        </div>

      </div>

      {/* Header */}
      <header className="grid gap-2">
        <h1 className="text-3xl font-bold leading-tight">{story.title}</h1>

        <div className="text-sm text-muted-foreground">
          By <span className="text-foreground font-medium">{story.byline ?? "—"}</span>
        </div>
      </header>

      {/* Synopsis card */}
      <section className="rounded-md border bg-card p-4">
        <div className="text-sm font-semibold">Synopsis</div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {story.synopsis?.trim() ? story.synopsis : "No synopsis yet."}
        </p>
      </section>

      {/* Chapters */}
      <section className="grid gap-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold">Chapters</h2>
          <div className="text-xs text-muted-foreground">Page {chapterPage + 1}</div>
        </div>

        {sortedChapters.length === 0 && (
          <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
            No published chapters yet.
          </div>
        )}

        <div className="grid gap-2">
          {sortedChapters.map((ch) => (
            <Link
              key={ch.id}
              to={`/chapters/${ch.id}`}
              className="rounded-md border bg-card px-3 py-3 transition hover:bg-muted/40"
            >
              <div className="text-sm text-muted-foreground">
                Chapter {ch.chapterNumber}
              </div>
              <div className="font-medium">{ch.title}</div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            type="button"
            onClick={() => setChapterPage((p) => Math.max(0, p - 1))}
            disabled={chapterPage === 0}
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => setChapterPage((p) => p + 1)}
            disabled={!chaptersHasNext}
          >
            Next
          </Button>
        </div>
      </section>
    </Container>
  )
}
