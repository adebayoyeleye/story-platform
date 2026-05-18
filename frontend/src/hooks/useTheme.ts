import { useCallback, useEffect, useState } from "react"
import { applyTheme, getInitialTheme, type Theme } from "@/lib/theme"

/**
 * Theme state for the React tree. The initial value is read from
 * localStorage / OS pref — but the DOM has already been styled by the
 * inline bootstrap in index.html, so React doesn't cause a flash.
 *
 * Returns [theme, toggle]. We deliberately don't return setTheme(value)
 * — keeping the API small. Add an explicit setter only when a feature
 * actually needs it.
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())

  // Keep DOM in sync with state. Runs once on mount and on every toggle.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"))
  }, [])

  return [theme, toggle]
}