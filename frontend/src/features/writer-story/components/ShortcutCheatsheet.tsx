import { useMemo } from "react"
import { SlideOver } from "@/components/ui/SlideOver"
import { WRITER_SHORTCUTS, type Shortcut } from "../shortcuts"
import { cn } from "@/lib/cn"

type Props = {
  open: boolean
  onClose: () => void
}

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform)

function renderKey(key: string): string {
  // Translate the abstract "Mod" to a real platform glyph
  if (key === "Mod") return isMac ? "⌘" : "Ctrl"
  if (key === "Shift") return isMac ? "⇧" : "Shift"
  if (key === "Esc") return "Esc"
  return key.toUpperCase()
}

export function ShortcutCheatsheet({ open, onClose }: Props) {
  // Group by section. Computed inside useMemo so the slide-over doesn't
  // re-bucket on every render.
  const grouped = useMemo(() => {
    const out: Record<Shortcut["group"], Shortcut[]> = {
      Editing: [],
      Navigation: [],
      View: [],
    }
    for (const s of WRITER_SHORTCUTS) {
      out[s.group].push(s)
    }
    return out
  }, [])

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="Keyboard shortcuts"
      width="md"
    >
      <div className="space-y-6">
        {(["Editing", "View", "Navigation"] as const).map((group) => {
          const items = grouped[group]
          if (items.length === 0) return null
          return (
            <section key={group}>
              <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-3">
                {group}
              </h3>
              <ul className="space-y-2">
                {items.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-sm">{s.label}</span>
                    <div className="flex gap-1 shrink-0">
                      {s.keys.map((k, j) => (
                        <Kbd key={j}>{renderKey(k)}</Kbd>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </SlideOver>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded",
        "border border-border bg-surface-muted",
        "font-mono text-[11px] text-foreground"
      )}
    >
      {children}
    </kbd>
  )
}