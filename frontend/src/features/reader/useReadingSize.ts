import { useCallback, useEffect, useState } from "react"

export type ReadingSize = "sm" | "md" | "lg"

const ORDER: ReadingSize[] = ["sm", "md", "lg"]
const STORAGE_KEY = "reading-size"

const FONT_SIZE_PX: Record<ReadingSize, number> = {
  sm: 18,
  md: 20, // matches --text-read-body in the design system
  lg: 22,
}

/**
 * Reader-controlled type size for the body. The value is applied to a
 * CSS variable on the reading-page container — `.story-richtext` (and
 * anything else that opts in) reads that variable and overrides
 * --text-read-body.
 *
 * Persists in localStorage. Default is "md" (20px) — the design system
 * default. We don't fall back to the OS text-size preference because
 * that's a different axis (it affects all UI, not just reading body),
 * and would create a conflict with browser-level zoom that already exists.
 *
 * Returns: [size, cycle, sizePx]. `cycle` advances to the next preset.
 */
export function useReadingSize(): [ReadingSize, () => void, number] {
  const [size, setSize] = useState<ReadingSize>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === "sm" || saved === "md" || saved === "lg") return saved
    } catch {
      /* storage blocked */
    }
    return "md"
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, size)
    } catch {
      /* storage blocked */
    }
  }, [size])

  const cycle = useCallback(() => {
    setSize((current) => {
      const idx = ORDER.indexOf(current)
      return ORDER[(idx + 1) % ORDER.length]
    })
  }, [])

  return [size, cycle, FONT_SIZE_PX[size]]
}