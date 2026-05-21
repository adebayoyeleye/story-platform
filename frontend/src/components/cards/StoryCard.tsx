import { Link } from "react-router-dom"
import type { StorySummary } from "@/types"
import { CoverImage } from "@/components/CoverImage"
import { UserAvatar } from "@/components/Avatar"
import {
  approxLineCount,
  approxReadMinutes,
  teaserFromHtml,
} from "@/lib/text"
import { cn } from "@/lib/cn"

import type { ContentType } from "@/types"
import { TypeBadge } from "../TypeBadge"

/**
 * Per-type sizing rules. Lives next to StoryCard rather than in
 * lib/contentType.ts because it's a card-layout concern, not a domain
 * concept — a future grid/list/hero variant might want different sizes.
 *
 * Aspect ratios picked from design mocks:
 *   Serial:  3:4 portrait (book-jacket feel)
 *   Short:   3:2 wide
 *   Article: 16:9 wide (hero photo feel)
 *   Poem:    none (text preview replaces cover)
 */
const CARD_LAYOUT: Record<
  ContentType,
  { width: string; coverAspect: string | null }
> = {
  STORY_WITH_CHAPTERS: { width: "w-52 md:w-56", coverAspect: "aspect-[3/4]" },
  SHORT_STORY:         { width: "w-56 md:w-60", coverAspect: "aspect-[3/2]" },
  ARTICLE:             { width: "w-72 md:w-80", coverAspect: "aspect-video" },
  POEM:                { width: "w-60 md:w-64", coverAspect: null },
}

type Props = {
  story: StorySummary
  /** "Read" (public) routes to /stories/:id; "Write" routes to /write/stories/:id. */
  intent?: "read" | "write"
  className?: string
}

/**
 * Type-aware card preview. Per design doc §4.1, each content type gets
 * its own meta row + (for POEM) a different preview body.
 *
 * Composition strategy: one component, switching only on the meta row
 * and the preview block. The cover/title/byline frame is shared. Keeps
 * a single layout in one place; per-type branches are isolated.
 */
export function StoryCard({ story, intent = "read", className }: Props) {
  const layout = CARD_LAYOUT[story.contentType]
  const isPoem = story.contentType === "POEM"

  const href = (() => {
    if (intent === "write") return `/write/stories/${story.id}`

    // Standalone types skip the detail page — there are no chapters to
    // list, and the work IS the body. Click straight into reading.
    if (story.contentType !== "STORY_WITH_CHAPTERS") {
      return `/stories/${story.id}/read`
    }

    return `/stories/${story.id}`
  })()

  return (
    <Link
      to={href}
      className={cn(
        "group block rounded-lg border border-border bg-surface overflow-hidden",
        "hover:border-primary/40 hover:shadow-sm transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        layout.width,
        className
      )}
    >
      {isPoem
        ? <PoemPreview story={story} />
        : <CardCover story={story} aspect={layout.coverAspect!} />}

      <div className="p-4">
        <TypeBadge type={story.contentType} className="mb-2" />

        <h3 className="font-serif font-semibold text-lg leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {story.title}
        </h3>

        <Byline story={story} />
        <CardPreviewText story={story} />
        <CardMeta story={story} />
      </div>
    </Link>
  )
}

// ---------- subcomponents ----------

// CardCover takes the aspect from the parent now:
function CardCover({ story, aspect }: { story: StorySummary; aspect: string }) {
  if (story.coverImageUrl) {
    return <img src={story.coverImageUrl} alt="" className={cn("w-full object-cover", aspect)} />
  }
  return <CoverImage seed={story.id} title={story.title} className={aspect} />
}


function PoemPreview({ story }: { story: StorySummary }) {
  const previewText = (story.teaser ?? story.synopsis ?? "").trim()

  return (
    <div className="relative h-44 px-5 pt-5 overflow-hidden font-serif text-sm leading-relaxed text-foreground whitespace-pre-wrap">
      {previewText || (
        <span className="text-muted-foreground italic">A new poem, untitled.</span>
      )}
      {/* Bottom fade — preserves last-line dignity rather than hard-cropping mid-letter.
          Pure CSS gradient overlay; respects light/dark via the surface token. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-surface to-transparent"
      />
    </div>
  )
}

function Byline({ story }: { story: StorySummary }) {
  const name = story.byline ?? "Anonymous"
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
      <UserAvatar seed={name} name={name} size="xs" />
      <span className="truncate">by {name}</span>
    </div>
  )
}

function CardPreviewText({ story }: { story: StorySummary }) {
  // Poem cards already lead with the verse; don't duplicate.
  if (story.contentType === "POEM") return null

  // Articles prefer the deck (a curated subtitle the writer chose);
  // fall back to synopsis. Everything else uses synopsis.
  const text =
    story.contentType === "ARTICLE"
      ? (story.deck ?? story.synopsis ?? "")
      : (story.synopsis ?? "")

  if (!text) return null

  return (
    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{text}</p>
  )
}

function CardMeta({ story }: { story: StorySummary }) {
  const parts: string[] = []

  switch (story.contentType) {
    case "STORY_WITH_CHAPTERS": {
      if (story.chapterCount) {
        parts.push(`${story.chapterCount} chapter${story.chapterCount === 1 ? "" : "s"}`)
      }
      // "Ongoing" / "Completed" comes from status
      if (story.status === "ONGOING") parts.push("Ongoing")
      if (story.status === "COMPLETED") parts.push("Completed")
      break
    }
    case "SHORT_STORY":
    case "ARTICLE": {
      if (story.wordCount) {
        const mins = approxReadMinutes(story.wordCount)
        parts.push(`~${mins} min read`)
        parts.push(`${story.wordCount.toLocaleString()} words`)
      }
      break
    }
    case "POEM": {
      if (story.teaser) {
        const lines = approxLineCount(story.teaser)
        if (lines > 0) parts.push(`${lines} line${lines === 1 ? "" : "s"}`)
      }
      break
    }
  }

  if (parts.length === 0) return null

  return (
    <div className="text-xs text-muted-foreground">
      {parts.join(" · ")}
    </div>
  )
}

// Keep teaserFromHtml available for callers that need it externally
export { teaserFromHtml }