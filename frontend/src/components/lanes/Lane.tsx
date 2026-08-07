import { useCallback, useRef } from "react"
import { AppLink as Link } from "@/components/AppLink"
import { cn } from "@/lib/cn"

type Props = {
  title: string
  /** Visual register for the title. "serif" for content lanes (the default),
      "mono" for utility lanes like Continue Reading where the title is more
      label than headline. */
  headerStyle?: "serif" | "mono"
  viewAllHref?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

/**
 * Horizontal scroll-snap card lane. Native CSS does the heavy lifting:
 *  - scroll-snap-type:x mandatory on the rail
 *  - scroll-snap-align:start on each child (set via the rail's CSS so
 *    callers don't have to remember)
 *  - overflow-x-auto for the scroll
 *
 * Arrow buttons are a pure enhancement — they call scrollBy() with
 * smooth behavior, which the global reduced-motion rule will downgrade
 * to instant for vestibular-sensitive users.
 */
export function Lane({
  title,
  headerStyle = "serif",
  viewAllHref,
  subtitle,
  children,
  className,
}: Props) {
  const railRef = useRef<HTMLDivElement>(null)

  const scrollBy = useCallback((delta: number) => {
    railRef.current?.scrollBy({ left: delta, behavior: "smooth" })
  }, [])

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          {headerStyle === "serif" ? (
            <h2 className="font-display text-2xl tracking-tight">{title}</h2>
          ) : (
            <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              {title}
            </h2>
          )}
          {subtitle && headerStyle === "serif" && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              to={viewAllHref}
              className="text-sm text-primary hover:opacity-80 hidden sm:inline"
            >
              View all →
            </Link>
          )}

          {/* Arrows: hidden on touch (no hover), shown on desktop */}
          <div className="hidden md:flex items-center gap-1">
            <ArrowButton dir="left" onClick={() => scrollBy(-600)} />
            <ArrowButton dir="right" onClick={() => scrollBy(600)} />
          </div>
        </div>
      </div>

      <div
        ref={railRef}
        className={cn(
          "flex gap-4 overflow-x-auto",
          // Native scroll-snap
          "snap-x snap-mandatory",
          // Hide scrollbar visually but keep functionality (touch +
          // keyboard scroll still work; mouse-wheel still works)
          "scrollbar-thin scrollbar-track-transparent",
          // Bleed-edge padding so cards near the edges aren't clipped
          "px-1 pb-1",
          // Children inherit snap-align via descendant selector below
          "[&>*]:snap-start [&>*]:shrink-0"
        )}
      >
        {children}
      </div>
    </section>
  )
}

function ArrowButton({
  dir,
  onClick,
}: {
  dir: "left" | "right"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
      className={cn(
        "inline-flex items-center justify-center h-8 w-8 rounded-full",
        "border border-border bg-surface text-muted-foreground",
        "hover:bg-surface-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "transition-colors"
      )}
    >
      <span aria-hidden="true">{dir === "left" ? "‹" : "›"}</span>
    </button>
  )
}