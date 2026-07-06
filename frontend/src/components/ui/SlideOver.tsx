import { useEffect, useRef } from "react"
import type { PropsWithChildren, ReactNode } from "react"
import { cn } from "@/lib/cn"

type Props = PropsWithChildren<{
  open: boolean
  onClose: () => void
  title: string
  /** Right-edge width preset. Most things fit in "md" (~28rem). */
  width?: "sm" | "md" | "lg"
  /** Optional content rendered in the header next to the title — e.g.
   *  tabs or a Save action. */
  headerAction?: ReactNode
}>

const WIDTH: Record<NonNullable<Props["width"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
}

/**
 * Right-edge slide-over panel. Used for settings/contributors next to
 * the editor, future publish dialog, etc.
 *
 * Mechanics:
 *  - Translate-x animation in CSS (no Motion needed)
 *  - Backdrop click closes
 *  - Esc closes
 *  - Focus moves to the panel on open (the close button gets it,
 *    since that's the safest fallback target)
 *
 * Limits:
 *  - Single-instance only (don't render two open at once — backdrop
 *    z-index war). Tracked as P-FOCUS-TRAP at the broader modal level.
 */
export function SlideOver({
  open,
  onClose,
  title,
  width = "md",
  headerAction,
  children,
}: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    queueMicrotask(() => closeBtnRef.current?.focus())
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop. We always render it (mounted) so the panel's
          transition is symmetric on entry and exit; opacity gates
          visibility, pointer-events gates interactivity. */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="slide-over-title"
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50 w-full bg-surface border-l border-border shadow-xl",
          "transform transition-transform duration-200 ease-out",
          "flex flex-col",
          WIDTH[width],
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border shrink-0">
          <h2
            id="slide-over-title"
            className="font-display text-lg"
          >
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {headerAction}
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Close"
              className={cn(
                "inline-flex items-center justify-center h-8 w-8 rounded-md",
                "text-muted-foreground hover:text-foreground hover:bg-surface-muted",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </>
  )
}