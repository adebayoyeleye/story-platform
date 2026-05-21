import { UserAvatar } from "@/components/Avatar"
import { TypeBadge } from "@/components/TypeBadge"
import type { ContentType } from "@/types"

type Props = {
  contentType: ContentType
  eyebrow?: string                  // "Chapter four" / null
  title: string
  byline?: string | null
  metaParts?: string[]              // ["12 min read", "Published 3 days ago"]
}

/**
 * The title+byline+meta block at the start of every reading page.
 * The eyebrow ("Chapter four") is consumer-provided so chapter pages
 * can use it, standalone pages can omit it.
 *
 * Visual ladder per the design mocks:
 *   1. Mono uppercase eyebrow (optional, muted)
 *   2. Serif H1 (read-h1 token, 40px)
 *   3. Byline row — avatar + name + dotted meta
 *   4. TypeBadge floats above eyebrow for standalone works
 */
export function ReadingHeader({
  contentType,
  eyebrow,
  title,
  byline,
  metaParts = [],
}: Props) {
  // Type badge sits above for standalone works (short / article / poem)
  // where readers haven't seen one yet. Chapter pages inherit context
  // from the story detail page they came from; no badge needed.
  const showBadge = contentType !== "STORY_WITH_CHAPTERS"

  const displayName = byline ?? "Anonymous"

  return (
    <header className="mb-10">
      {showBadge && (
        <div className="mb-3">
          <TypeBadge type={contentType} />
        </div>
      )}

      {eyebrow && (
        <div className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground mb-3">
          {eyebrow}
        </div>
      )}

      <h1
        className="font-serif font-semibold leading-tight tracking-tight mb-4"
        style={{
          fontSize: "var(--text-read-h1)",
          lineHeight: "var(--text-read-h1--line-height)",
        }}
      >
        {title}
      </h1>

      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <UserAvatar seed={displayName} name={displayName} size="xs" />
        <span>{displayName}</span>
        {metaParts.map((part, i) => (
          <span key={i} className="flex items-center gap-3">
            <span aria-hidden="true" className="w-0.5 h-0.5 rounded-full bg-muted-foreground" />
            <span>{part}</span>
          </span>
        ))}
      </div>
    </header>
  )
}