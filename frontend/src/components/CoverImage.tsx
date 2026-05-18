import { useMemo } from "react"
import { cyrb53 } from "@/lib/hash"
import { cn } from "@/lib/cn"

type Props = {
  /** Stable id used to seed the gradient. Story id is the canonical choice. */
  seed: string
  /** If provided, the first character is rendered bottom-left as a watermark. */
  title?: string
  /** Tailwind sizing classes for the container. Default is card-friendly 3:4. */
  className?: string
  /** Skip the title-letter overlay (useful for very small thumbnails). */
  hideLetter?: boolean
}

/**
 * Deterministic gradient cover for any work that lacks an uploaded image.
 * Same seed = same cover, forever. Algorithm: §4.3 of the design doc.
 *
 * Design choices:
 *  - HSL color space, not hex. Lets us bound saturation/lightness for
 *    consistent perceived contrast across hues.
 *  - Light/dark mode aware via the .dark class — checked at render time
 *    via matchMedia, but really we just pick the light-mode ranges
 *    because covers should be vivid enough to read either way. Dark
 *    surfaces show the same cover and it still works.
 *  - The letter watermark uses font-display (Fraunces) at 80% opacity
 *    white. Identifiable at a glance, not noisy.
 */
export function CoverImage({ seed, title, className, hideLetter }: Props) {
  const style = useMemo(() => {
    const h = cyrb53(seed)

    // Two hues, forced ≥ 40° apart so the gradient visibly travels
    const h1 = h % 360
    let h2 = (h >>> 8) % 360
    if (Math.abs(h2 - h1) < 40) {
      h2 = (h1 + 60) % 360
    }

    // Light-mode ranges (work fine on dark surfaces too — covers don't
    // need to invert, they're decorative blocks of color)
    const s1 = 35 + ((h >>> 12) % 21)   // 35–55%
    const s2 = 35 + ((h >>> 14) % 21)
    const l1 = 65 + ((h >>> 16) % 11)   // 65–75%
    const l2 = 65 + ((h >>> 18) % 11)
    const angle = (h >>> 20) % 360

    return {
      backgroundImage: `linear-gradient(${angle}deg, hsl(${h1} ${s1}% ${l1}%), hsl(${h2} ${s2}% ${l2}%))`,
    }
  }, [seed])

  const letter =
    !hideLetter && title?.trim()
      ? title.trim()[0].toUpperCase()
      : null

  return (
    <div
      className={cn(
        "relative w-full aspect-[3/4] rounded-md overflow-hidden",
        className
      )}
      style={style}
      role="img"
      aria-label={title ? `Cover for ${title}` : "Cover"}
    >
      {letter && (
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-3 font-display text-5xl text-white/80 select-none"
        >
          {letter}
        </span>
      )}
    </div>
  )
}