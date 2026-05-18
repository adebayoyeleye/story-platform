import { useEffect, useRef } from "react"
import type { ContentType } from "@/types"
import { CONTENT_TYPE_META, CONTENT_TYPE_ORDER } from "@/lib/contentType"
import { cn } from "@/lib/cn"

type Props = {
  open: boolean
  onClose: () => void
  onChoose: (type: ContentType) => void
}

/**
 * Modal that asks the writer what they're creating. Closes on Esc,
 * on backdrop click, and after a choice is made.
 *
 * Accessibility: role="dialog", aria-modal, focus trapped to the first
 * choice button on open, focus returned to the trigger on close (caller's
 * responsibility — we don't store the trigger ref here).
 */
export function ContentTypeChooser({ open, onClose, onChoose }: Props) {
  const firstButtonRef = useRef<HTMLButtonElement>(null)

  // Esc to close, autofocus the first option on open
  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    // Defer focus so the open animation doesn't fight us
    queueMicrotask(() => firstButtonRef.current?.focus())

    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-type-chooser-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl rounded-lg bg-surface shadow-xl border border-border p-8">
        <h2
          id="content-type-chooser-title"
          className="font-display text-2xl mb-2"
        >
          What are you creating today?
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Each kind of work has its own writing surface and reading experience.
          You can&apos;t change this later.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONTENT_TYPE_ORDER.map((type, idx) => {
            const meta = CONTENT_TYPE_META[type]
            return (
              <button
                key={type}
                ref={idx === 0 ? firstButtonRef : undefined}
                onClick={() => onChoose(type)}
                className={cn(
                  "group text-left rounded-md border border-border p-4",
                  "hover:border-primary hover:bg-surface-muted transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                )}
              >
                <div className="flex items-baseline gap-3 mb-1">
                  <span
                    className="text-lg text-primary"
                    aria-hidden="true"
                  >
                    {meta.icon}
                  </span>
                  <span className="font-medium">{meta.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {meta.description}
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}