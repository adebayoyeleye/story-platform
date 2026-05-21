import { Link } from "react-router-dom"
import type { PropsWithChildren, ReactNode } from "react"
import { useTheme } from "@/hooks/useTheme"
import { useReadingSize } from "@/features/reader/useReadingSize"
import { ReadingProgress } from "./ReadingProgress"
import { cn } from "@/lib/cn"

type Props = PropsWithChildren<{
  /**
   * Where the back arrow returns to. For chapter pages this is the
   * parent story detail. For standalone works (short story, article,
   * poem) it's the discovery surface for that type, or just home.
   */
  backHref: string
  backLabel: string
  /**
   * Optional eyebrow shown in the top bar to right of back. For chapter
   * pages: "Ch. 4 of 12". For standalone works: usually omitted.
   */
  eyebrow?: string
  /**
   * Optional bottom navigation slot — chapter prev/next pagers,
   * "More by [author]" pill, etc. Each variant fills as appropriate.
   */
  bottomNav?: ReactNode
  /**
   * Width preset. "default" caps at max-w-2xl (~672px) — the prose ideal
   * per design doc §2.1. "narrow" caps at max-w-xl (~576px) for poems
   * where the column wants to feel more intimate. §4.2.
   */
  width?: "default" | "narrow"
}>

/**
 * The reading-page frame. Owns:
 *   - Top mini-bar (back, eyebrow, size cycler, theme toggle)
 *   - Reading-progress bar at the very top of viewport
 *   - Centered prose column with width preset
 *   - Optional bottom-nav slot
 *
 * Does NOT own:
 *   - The title/byline header (varies per content type — see ReadingHeader)
 *   - The body markup (each type renders its own — see ReadingBody)
 *   - AppShell — reading pages deliberately don't use it
 */
export function ReadingShell({
  backHref,
  backLabel,
  eyebrow,
  bottomNav,
  width = "default",
  children,
}: Props) {
  const [theme, toggleTheme] = useTheme()
  const [size, cycleSize, sizePx] = useReadingSize()

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col"
      // Reader-controlled body type size. Applies to anything reading
      // --reading-body-size; .story-richtext picks it up via index.css.
      style={{ "--reading-body-size": `${sizePx}px` } as React.CSSProperties}
    >
      <ReadingProgress />

      {/* Top mini-bar — intentionally lighter than AppShell's header */}
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-12 flex items-center gap-3">
          <Link
            to={backHref}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 truncate"
            aria-label={`Back to ${backLabel}`}
          >
            <span aria-hidden="true">←</span>
            <span className="truncate">{backLabel}</span>
          </Link>

          {eyebrow && (
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
              {eyebrow}
            </span>
          )}

          <div className="ml-auto flex items-center gap-1">
            <ToolbarButton
              onClick={cycleSize}
              ariaLabel={`Type size: ${size}. Click to cycle.`}
              title={`Type size: ${size}`}
            >
              {/* Visual cue — the "A" grows as size grows */}
              <span aria-hidden="true" className="font-serif">
                {size === "sm" ? "a" : size === "md" ? "A" : <span className="text-base">A</span>}
              </span>
            </ToolbarButton>
            <ToolbarButton
              onClick={toggleTheme}
              ariaLabel={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title="Theme"
            >
              <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
            </ToolbarButton>
          </div>
        </div>
      </div>

      <main
        className={cn(
          "flex-1 mx-auto w-full px-6 py-12 md:py-16",
          width === "narrow" ? "max-w-xl" : "max-w-2xl"
        )}
      >
        {children}
      </main>

      {bottomNav && (
        <div className="border-t border-border bg-surface/40 mt-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4">{bottomNav}</div>
        </div>
      )}
    </div>
  )
}

function ToolbarButton({
  children,
  onClick,
  ariaLabel,
  title,
}: {
  children: ReactNode
  onClick: () => void
  ariaLabel: string
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        "inline-flex items-center justify-center h-8 w-8 rounded-md",
        "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        "transition-colors text-sm"
      )}
    >
      {children}
    </button>
  )
}