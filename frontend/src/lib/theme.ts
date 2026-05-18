const STORAGE_KEY = "theme"

export type Theme = "light" | "dark"

/**
 * Read the user's preferred theme. Order:
 *   1. Saved choice in localStorage
 *   2. OS / browser preference via prefers-color-scheme
 *   3. Default "light"
 *
 * Pure read — does NOT mutate the DOM. Call applyTheme() to do that.
 */
export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "light" || saved === "dark") return saved
  } catch {
    /* SSR or storage blocked — fall through */
  }

  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  ) {
    return "dark"
  }

  return "light"
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  // color-scheme tells the browser to render native widgets (scrollbars,
  // form controls) in matching theme. Without it, scrollbars stay light
  // in dark mode and look out of place.
  root.style.colorScheme = theme

  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* storage blocked — choice still applied for this session */
  }
}