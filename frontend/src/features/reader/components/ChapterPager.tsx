import { AppLink as Link } from "@/components/AppLink"
import type { ChapterSummary } from "@/types"

type Props = {
  nav: {
    prev?: ChapterSummary
    next?: ChapterSummary
    current: number
    total: number
  }
}

/**
 * Bottom-of-page chapter pagers per design doc §5.3:
 *   ← Previous · Ch. 3 · A Borrowed Coat
 *                                      4 / 12
 *   Next · Ch. 5 · Three Quiet Years →
 *
 * Mobile: collapses to compact arrows + counter.
 */
export function ChapterPager({ nav }: Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      <PagerLink chapter={nav.prev} dir="prev" />
      <div className="text-xs text-muted-foreground font-mono">
        {nav.current} / {nav.total}
      </div>
      <PagerLink chapter={nav.next} dir="next" />
    </div>
  )
}

function PagerLink({
  chapter,
  dir,
}: {
  chapter?: ChapterSummary
  dir: "prev" | "next"
}) {
  if (!chapter) {
    return <div className="w-32 sm:w-48" aria-hidden="true" />
  }
  const isPrev = dir === "prev"
  return (
    <Link
      to={`/chapters/${chapter.id}`}
      className="group flex items-center gap-2 max-w-[12rem] sm:max-w-[18rem] text-foreground hover:text-primary transition-colors"
    >
      {isPrev && <span aria-hidden="true" className="text-muted-foreground">←</span>}
      <div className={isPrev ? "" : "text-right"}>
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {isPrev ? "Previous" : "Next"}
        </div>
        <div className="text-sm font-medium truncate">
          Ch. {chapter.chapterNumber} · {chapter.title}
        </div>
      </div>
      {!isPrev && <span aria-hidden="true" className="text-muted-foreground">→</span>}
    </Link>
  )
}