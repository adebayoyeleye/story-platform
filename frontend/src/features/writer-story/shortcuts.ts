/**
 * Single source of truth for writer-editor shortcuts. The cheatsheet
 * renders from this list; the bindings in WriterStoryScreen reference
 * the same entries.
 *
 * Renaming a shortcut here changes both the binding and the display —
 * by design.
 */
export type Shortcut = {
  /** Human label for the cheatsheet. */
  label: string
  /** Keys to display, in order. "Mod" renders as ⌘ on Mac, Ctrl elsewhere. */
  keys: string[]
  /** Grouping for the cheatsheet UI. */
  group: "Editing" | "Navigation" | "View"
}

export const WRITER_SHORTCUTS: Shortcut[] = [
  { group: "Editing",    label: "Save",                       keys: ["Mod", "S"] },
  { group: "Editing",    label: "Bold",                       keys: ["Mod", "B"] },
  { group: "Editing",    label: "Italic",                     keys: ["Mod", "I"] },
  { group: "Editing",    label: "Undo",                       keys: ["Mod", "Z"] },
  { group: "Editing",    label: "Redo",                       keys: ["Mod", "Shift", "Z"] },

  { group: "View",       label: "Focus mode (distraction-free)", keys: ["Mod", "."] },
  { group: "View",       label: "Toggle chapter sidebar",     keys: ["Mod", "\\"] },
  { group: "View",       label: "Show this cheatsheet",       keys: ["?"] },
  { group: "View",       label: "Close any panel / exit focus", keys: ["Esc"] },
]