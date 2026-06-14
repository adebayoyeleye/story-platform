import { Link } from "react-router-dom"
import type { PropsWithChildren, ReactNode } from "react"
// import { Button } from "@/components/ui/Button"
import { useTheme } from "@/hooks/useTheme"
import { cn } from "@/lib/cn"

export type SaveState =
  | { status: "idle" }
  | { status: "dirty" }
  | { status: "saving" }
  | { status: "saved"; at: Date }
  | { status: "error"; message: string; retry?: () => void }

type Props = PropsWithChildren<{
  storyTitle: string
  saveState: SaveState
  wordCount?: number
  /** Right-side action button cluster — usually a Save/Publish button. */
  primaryAction?: ReactNode
  /** Optional left sidebar (chapter list). Hidden when not provided. */
  sidebar?: ReactNode
  /** Distraction-free mode. Top bar collapses to 2px, sidebar hides,
   *  editor widens. Cmd/Ctrl+. or Esc to toggle (parent owns the state
   *  and the keyboard bindings). */
  focusMode?: boolean
}>

/**
 * Editor chrome shell per design doc §6.2.
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │ ← Exit │ Title          ● Saved 12:42  2,341 words ✎│   48px bar
 *   ├────────┼─────────────────────────────────────────────┤
 *   │ [opt.] │                                             │
 *   │ sidebar│   children (the Tiptap editor + headers)    │
 *   │ 240px  │                                             │
 *   │        │                                             │
 *   └────────┴─────────────────────────────────────────────┘
 *
 * The sidebar is opt-in — only chaptered stories render one. The
 * primaryAction slot is right-aligned in the top bar.
 *
 * Deliberately not inside AppShell — editor chrome differs from
 * global chrome (no Read/Write nav, no big wordmark, save state
 * always visible).
 */
export function WriterShell({
  storyTitle,
  saveState,
  wordCount,
  primaryAction,
  sidebar,
  focusMode = false,
  children,
}: Props) {
  const [theme, toggleTheme] = useTheme()

  return (
    <div
      className={cn(
        "min-h-screen text-foreground flex flex-col transition-colors",
        // Subtly different background in focus mode — same idea as iA
        // Writer's focus mode: the page itself feels "in a different mode"
        focusMode ? "bg-surface-muted/30" : "bg-background"
      )}
    >
      {/* Top bar — collapses to a thin line in focus mode that reveals
          on hover so writers can still exit / see save state. */}
      <header
        className={cn(
          "group border-b border-border bg-background",
          "transition-[height] duration-200",
          focusMode ? "h-1 hover:h-12 overflow-hidden" : "h-12"
        )}
      >
        <div className="px-3 h-12 flex items-center gap-3">
          <Link
            to="/write"
            className={cn(
              "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">Exit</span>
          </Link>

          <div className="w-px h-5 bg-border" aria-hidden="true" />

          <div className="font-serif text-sm font-semibold truncate min-w-0 max-w-xs">
            {storyTitle}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <SaveStateIndicator state={saveState} />
            {typeof wordCount === "number" && (
              <span className="text-xs text-muted-foreground tabular-nums font-mono">
                {wordCount.toLocaleString()} words
              </span>
            )}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
            </button>
            {primaryAction}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar hides entirely in focus mode */}
        {sidebar && !focusMode && (
          <aside className="w-60 shrink-0 border-r border-border bg-surface-muted/50 overflow-y-auto">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>

      {/* Discrete bottom-right hint about focus mode. Only shown when
          focus mode is on — like iA Writer. */}
      {focusMode && (
        <div className="fixed bottom-4 right-4 text-xs text-muted-foreground font-mono pointer-events-none">
          Esc to exit
        </div>
      )}
    </div>
  )
}

function SaveStateIndicator({ state }: { state: SaveState }) {
  const { dot, label } = describe(state)
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span
        aria-hidden="true"
        className={cn("w-1.5 h-1.5 rounded-full", dot)}
      />
      {label}
    </span>
  )
}

function describe(state: SaveState): { dot: string; label: string } {
  switch (state.status) {
    case "idle":
      return { dot: "bg-muted-foreground/40", label: "" }
    case "dirty":
      return { dot: "bg-accent", label: "Unsaved changes" }
    case "saving":
      return { dot: "bg-primary animate-pulse", label: "Saving…" }
    case "saved":
      return {
        dot: "bg-success",
        label: `Saved ${state.at.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      }
    case "error":
      return { dot: "bg-error", label: state.message }
  }
}