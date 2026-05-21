import { useEffect, useState } from "react"

/**
 * Thin top-of-viewport bar tracking page scroll. 2px tall, primary color
 * at 60% opacity. Drops to 0% at top and grows to 100% as the user
 * reaches the bottom of the document.
 *
 * Implementation: rAF-throttled scroll listener. Cheap (~one layout
 * read per frame); doesn't sample more often than the screen refreshes.
 * Reduced-motion users still see the bar grow — it's not an animation,
 * it's a position indicator. Different from a parallax effect.
 *
 * Scoped to the global document scroll. If a reading view ever uses
 * an internal scroll container, this needs a ref-based variant.
 */
export function ReadingProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let raf = 0

    const update = () => {
      // Total scrollable height = full document height minus the viewport.
      // Avoid divide-by-zero on very short pages.
      const max = document.documentElement.scrollHeight - window.innerHeight
      const next = max > 0 ? Math.min(1, window.scrollY / max) : 0
      setPct(next)
      raf = 0
    }

    const onScroll = () => {
      // Coalesce multiple scroll events into one rAF tick. Without this,
      // scrolling fires the listener ~60-120 times per second per platform;
      // we want at most one read per frame.
      if (raf === 0) {
        raf = requestAnimationFrame(update)
      }
    }

    update() // initial value, in case page loads scrolled mid-document
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none"
    >
      <div
        className="h-full bg-primary/60 origin-left"
        style={{ transform: `scaleX(${pct})` }}
      />
    </div>
  )
}