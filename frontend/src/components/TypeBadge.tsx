import type { ContentType } from "@/types"
import { CONTENT_TYPE_META } from "@/lib/contentType"
import { cn } from "@/lib/cn"

type Props = {
  type: ContentType
  className?: string
}

/**
 * Small pill conveying what kind of work this is. Used on cards, story
 * detail headers, reading page top chrome. One canonical visual rule;
 * never restyled per surface (consistency > local cleverness).
 */
export function TypeBadge({ type, className }: Props) {
  const meta = CONTENT_TYPE_META[type]
  return (
    <span
      title={meta.description}
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2 rounded-full",
        "border border-border bg-surface-muted",
        "text-[11px] font-semibold tracking-wider uppercase text-foreground",
        className
      )}
    >
      <span aria-hidden="true" className="text-primary">{meta.icon}</span>
      {meta.shortLabel}
    </span>
  )
}