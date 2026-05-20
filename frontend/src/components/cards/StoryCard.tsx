import { Link } from "react-router-dom"
import type { StorySummary } from "@/types"
import { CONTENT_TYPE_META } from "@/lib/contentType"
import { CoverImage } from "@/components/CoverImage"
import { UserAvatar } from "@/components/Avatar"
import {
  approxLineCount,
  approxReadMinutes,
  teaserFromHtml,
} from "@/lib/text"
import { cn } from "@/lib/cn"

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
  const meta = CONTENT_TYPE_META[story.contentType]
  const isPoem = story.contentType === "POEM"

  const href = intent === "write" ? `/write/stories/${story.id}` : `/stories/${story.id}`

  return (
    <Link
      to={href}
      className={cn(
        "group block rounded-lg border border-border bg-surface overflow-hidden",
        "hover:border-primary/40 hover:shadow-sm transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        className
      )}
    >
      {/* Poem cards lead with a text teaser, not a full cover.
          Other cards lead with the cover (uploaded or generated). */}
      {isPoem ? (
        <PoemPreview story={story} />
      ) : (
        <CardCover story={story} />
      )}

      <div className="p-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className="text-xs text-muted-foreground inline-flex items-center gap-1"
            title={meta.description}
          >
            <span aria-hidden="true">{meta.icon}</span>
            {meta.shortLabel}
          </span>
        </div>

        <h3 className="font-semibold text-lg leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {story.title}
        </h3>

        <Byline story={story} />

        <CardMeta story={story} />
      </div>
    </Link>
  )
}

// ---------- subcomponents ----------

function CardCover({ story }: { story: StorySummary }) {
  if (story.coverImageUrl) {
    return (
      <img
        src={story.coverImageUrl}
        alt=""
        className="w-full aspect-[3/4] object-cover"
      />
    )
  }
  return <CoverImage seed={story.id} title={story.title} className="aspect-[3/4]" />
}

function PoemPreview({ story }: { story: StorySummary }) {
  // Poems: prefer the server-rendered `teaser` if present (already
  // line-aware), else fall back to deriving from synopsis. We deliberately
  // do NOT show a full cover — design doc §4.1 calls this out.
  const previewText = (story.teaser ?? story.synopsis ?? "").trim()

  return (
    <div className="px-5 pt-5 pb-2 min-h-[160px] font-serif text-base text-foreground whitespace-pre-wrap overflow-hidden">
      <div className="line-clamp-4">
        {previewText || (
          <span className="text-muted-foreground italic">
            A new poem, untitled.
          </span>
        )}
      </div>
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