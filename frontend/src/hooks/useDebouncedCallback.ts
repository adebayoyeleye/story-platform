import { useEffect, useRef, useCallback } from "react"

/**
 * Returns a stable function that, when called, schedules `fn` to run
 * after `delayMs` of inactivity. Subsequent calls within that window
 * reset the timer.
 *
 * Cancels on unmount.
 *
 * Design choice: we keep `fn` in a ref rather than baking it into the
 * dependency array. This means the latest closure is always used (no
 * stale callbacks) without forcing every call site to memoize `fn`.
 * Pattern adapted from the well-known useEventCallback recipe.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number
): (...args: Args) => void {
  const fnRef = useRef(fn)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Always point at the latest fn — avoids stale-closure bugs
  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  // Clear on unmount
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  return useCallback(
    (...args: Args) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => fnRef.current(...args), delayMs)
    },
    [delayMs]
  )
}