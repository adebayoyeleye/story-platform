import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { apiGet } from "@/api/http"
import type { Chapter, ChapterSummary } from "@/types"
import { Container } from "@/components/layout/Container"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/components/ui/ToastHost"
import { setContinueReading } from "@/features/reader/continueReading"
import { RichTextContent } from "@/features/reader/components/RichTextContent"

type Nav = { prev?: ChapterSummary; next?: ChapterSummary }

export default function ChapterReadPage() {
  const { chapterId } = useParams()
  const toast = useToast()

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [nav, setNav] = useState<Nav>({})
  const [loading, setLoading] = useState(true)
  const [navLoading, setNavLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // compute a friendly label
  const chapterLabel = useMemo(() => {
    if (!chapter) return ""
    const num = (chapter as any).chapterNumber
    return typeof num === "number" ? `Chapter ${num}` : "Chapter"
  }, [chapter])

  useEffect(() => {
    if (!chapterId) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      setNav({})
      try {
        // 1) Load chapter
        const data = await apiGet<Chapter>(`/api/v1/content/chapters/${chapterId}`)
        if (cancelled) return
        setChapter(data)

        // ✅ continue reading (Phase 2 local)
        setContinueReading(data.storyId, {
          chapterId: data.id,
          chapterTitle: data.title,
          chapterNumber: (data as any).chapterNumber,
        })

        // 2) Load chapters list for prev/next
        setNavLoading(true)
        const page = await apiGet<any>(
          `/api/v1/content/stories/${data.storyId}/chapters?page=0&size=500`
        )
        if (cancelled) return

        const list: ChapterSummary[] = (page.content ?? []).slice()

        // Sort by chapterNumber if present (best UX)
        list.sort((a: any, b: any) => {
          const an = a.chapterNumber ?? 0
          const bn = b.chapterNumber ?? 0
          return an - bn
        })

        const idx = list.findIndex((c) => c.id === data.id)
        setNav({
          prev: idx > 0 ? list[idx - 1] : undefined,
          next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined,
        })
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load chapter")
      } finally {
        if (cancelled) return
        setLoading(false)
        setNavLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [chapterId])

  if (loading) return <Container>Loading chapter...</Container>
  if (error) return <Container className="text-red-600">{error}</Container>
  if (!chapter) return <Container>Chapter not found.</Container>

  return (
    <Container className="grid gap-4">
      {/* Top mini header (consistent “app chrome”) */}
      <div className="flex items-center justify-between gap-2">
        <Link to={`/stories/${chapter.storyId}`}>
          <Button variant="ghost" type="button">← Back</Button>
        </Link>

        <div className="min-w-0 text-center">
          <div className="text-xs text-muted-foreground">{chapterLabel}</div>
          <div className="truncate text-sm font-medium">{chapter.title}</div>
        </div>

        <div className="flex gap-1">
          <Link to={nav.prev ? `/chapters/${nav.prev.id}` : "#"}>
            <Button
              variant="ghost"
              type="button"
              disabled={!nav.prev || navLoading}
              aria-disabled={!nav.prev || navLoading}
              title={nav.prev ? "Previous chapter" : "No previous chapter"}
            >
              Prev
            </Button>
          </Link>

          <Link to={nav.next ? `/chapters/${nav.next.id}` : "#"}>
            <Button
              variant="ghost"
              type="button"
              disabled={!nav.next || navLoading}
              aria-disabled={!nav.next || navLoading}
              title={nav.next ? "Next chapter" : "No next chapter"}
            >
              Next
            </Button>
          </Link>
        </div>
      </div>

      {/* Content card (same look/feel as other pages) */}
      <div className="rounded-md border bg-card p-4 md:p-6">
        <div className="text-sm text-muted-foreground">
          {navLoading ? "Loading navigation…" : " "}
        </div>

        {/* IMPORTANT: remove font-serif to match the rest of the app */}
        {/* <div className="mt-3 whitespace-pre-wrap text-base leading-7 text-foreground">
          {chapter.content}
        </div> */}
        <div className="mt-3">
          {chapter.contentFormat === "RICH_TEXT_HTML" ? (
            <RichTextContent html={chapter.content} />
          ) : (
            <div className="whitespace-pre-wrap text-base leading-7 text-foreground">
              {chapter.content}
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav (mobile-friendly) */}
      <div className="flex items-center justify-between gap-2">
        <Link to={nav.prev ? `/chapters/${nav.prev.id}` : "#"}>
          <Button variant="secondary" type="button" disabled={!nav.prev || navLoading}>
            ← Prev
          </Button>
        </Link>

        <Button
          variant="ghost"
          type="button"
          onClick={() => toast.push({ title: "Progress saved", kind: "info" })}
        >
          ⋯
        </Button>

        <Link to={nav.next ? `/chapters/${nav.next.id}` : "#"}>
          <Button variant="secondary" type="button" disabled={!nav.next || navLoading}>
            Next →
          </Button>
        </Link>
      </div>
    </Container>
  )
}
