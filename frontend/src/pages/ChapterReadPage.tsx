import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import type { Chapter, StorySummary } from "@/types"
import { apiGet } from "@/api/http"
import { Container } from "@/components/layout/Container"

export default function ChapterReadPage() {
  const { chapterId } = useParams()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [storyTitle, setStoryTitle] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chapterId) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await apiGet<Chapter>(`/api/v1/content/chapters/${chapterId}`)
        if (cancelled) return
        setChapter(data)
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load chapter")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [chapterId])

  // fetch story title for header (best-effort; don’t block reading)
  useEffect(() => {
    if (!chapter?.storyId) return
    let cancelled = false

    ;(async () => {
      try {
        const s = await apiGet<StorySummary>(`/api/v1/content/stories/${chapter.storyId}`)
        if (!cancelled) setStoryTitle(s.title ?? "")
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [chapter?.storyId])

  if (loading) return <Container>Loading chapter…</Container>
  if (error) return <Container className="text-red-600">{error}</Container>
  if (!chapter) return <Container>Chapter not found.</Container>

  return (
    <Container className="font-serif leading-relaxed">
      {/* Sticky mini header */}
      <div className="sticky top-0 z-10 -mx-5 mb-6 border-b bg-background/80 px-5 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link
            to={`/stories/${chapter.storyId}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back
          </Link>

          <div className="min-w-0 text-center">
            <div className="truncate text-xs text-muted-foreground">
              {storyTitle || "Story"}
            </div>
            <div className="truncate text-sm font-medium text-foreground">
              {chapter.title}
            </div>
          </div>

          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            Library
          </Link>
        </div>
      </div>

      {/* Chapter content */}
      <h2 className="text-3xl font-bold mb-6">{chapter.title}</h2>
      <div className="text-lg whitespace-pre-wrap">{chapter.content}</div>
    </Container>
  )
}
