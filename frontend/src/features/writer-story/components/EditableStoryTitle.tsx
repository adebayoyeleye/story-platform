import { useEffect, useRef, useState } from "react"
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback"
import { cn } from "@/lib/cn"

const UNTITLED = "Untitled"

type Props = {
  /** Current canonical title (server-truth). */
  title: string
  /**
   * Called when the title should be persisted. Debounced upstream of this
   * call — you'll receive the new value at most once per 800ms of typing.
   * Trim already applied.
   */
  onCommit: (nextTitle: string) => void | Promise<void>
}

/**
 * Headline title for the writer editor. Behavior:
 *
 *  - Renders as an `<input>` styled as a heading (no border, no chrome).
 *    Always editable — no toggle, no double-click-to-edit. The Substack
 *    / Notion / Ghost convention.
 *  - If the title equals "Untitled" on mount, focus the input and select
 *    all so the writer's first keystroke replaces it. This is the
 *    onboarding moment — the value of the editor is the author's voice,
 *    and that starts with naming the thing.
 *  - Once focused-or-typed past "Untitled", we don't re-focus on rerender.
 *  - Commits debounced (800ms) and on blur.
 *  - Empty submission falls back to "Untitled" rather than persisting a
 *    blank title — server may reject blank, and the user clearly meant
 *    something.
 */
export function EditableStoryTitle({ title, onCommit }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(title)

  // Keep local state in sync if the server-truth changes from outside
  // (e.g., after a save round-trip). Avoid clobbering active edits — only
  // sync when the input isn't focused.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setValue(title)
    }
  }, [title])

  // First-mount focus when this is a fresh "Untitled" work.
  // The ref + once-only flag prevents re-focusing on later renders.
  const didAutoFocus = useRef(false)
  useEffect(() => {
    if (didAutoFocus.current) return
    if (title === UNTITLED) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    didAutoFocus.current = true
  }, [title])

  const commit = (next: string) => {
    const clean = next.trim() || UNTITLED
    if (clean !== title) {
      onCommit(clean)
    }
  }

  const debouncedCommit = useDebouncedCallback(commit, 800)

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => {
        const next = e.target.value
        setValue(next)
        debouncedCommit(next)
      }}
      onBlur={() => commit(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          inputRef.current?.blur() // triggers commit
        }
      }}
      placeholder={UNTITLED}
      aria-label="Work title"
      className={cn(
        // Looks like an H1, behaves like an input
        "font-display text-4xl bg-transparent w-full",
        "border-0 outline-0 p-0",
        "placeholder:text-muted-foreground/50",
        // Subtle focus state — a quiet underline rather than a ring,
        // so it doesn't fight the headline feel
        "focus:[box-shadow:inset_0_-1px_0_0_hsl(var(--border))]",
        "transition-[box-shadow] duration-150"
      )}
    />
  )
}