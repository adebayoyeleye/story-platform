import { useEffect } from "react"

type Modifier = "mod" | "shift" | "alt"

type Options = {
  /** Modifier keys required. "mod" = Cmd on Mac, Ctrl elsewhere. */
  modifiers?: Modifier[]
  /** The non-modifier key, lowercase. Compared against e.key. */
  key: string
  /** What to run. Receives the event so the handler can preventDefault. */
  handler: (e: KeyboardEvent) => void
  /** Defaults true. Set false to disable conditionally. */
  enabled?: boolean
}

/**
 * Bind a global keyboard shortcut. Handles platform-correct Cmd vs Ctrl
 * via the "mod" modifier (resolved at fire-time, not at bind-time —
 * matters when a user moves windows across machines, rare but real).
 *
 * Shortcuts fire even when focus is inside inputs or contentEditable
 * — by design, since editor shortcuts (Cmd+S, focus mode) need to
 * trigger while the user is typing. If a future shortcut needs to NOT
 * fire in inputs, add an `ignoreInInputs` option.
 *
 * Returns nothing; the binding lives for the lifetime of the host
 * component.
 */
export function useKeyboardShortcut({
  modifiers = [],
  key,
  handler,
  enabled = true,
}: Options): void {
  useEffect(() => {
    if (!enabled) return

    const onKey = (e: KeyboardEvent) => {
      // Compare lowercase to be case-insensitive across Shift states.
      if (e.key.toLowerCase() !== key.toLowerCase()) return

      const wantsMod = modifiers.includes("mod")
      const wantsShift = modifiers.includes("shift")
      const wantsAlt = modifiers.includes("alt")

      // Cmd on Mac, Ctrl elsewhere. navigator.platform is deprecated
      // but still works; userAgentData would be the modern path but
      // isn't in older Safari.
      const isMac = /Mac|iPhone|iPad/.test(navigator.platform)
      const hasMod = isMac ? e.metaKey : e.ctrlKey

      if (wantsMod !== hasMod) return
      if (wantsShift !== e.shiftKey) return
      if (wantsAlt !== e.altKey) return

      handler(e)
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [modifiers.join("+"), key, handler, enabled])
}