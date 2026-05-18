import Avatar from "boring-avatars"
import { cyrb53 } from "@/lib/hash"
import { cn } from "@/lib/cn"

type Size = "xs" | "sm" | "md" | "lg" | "xl"

type Props = {
  /** Stable id to seed the pattern. User id is canonical. */
  seed: string
  /** Display name. Used for alt text and for initials fallback at xs. */
  name?: string
  size?: Size
  className?: string
}

const sizePx: Record<Size, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
}

/**
 * On-brand placeholder avatar, deterministic from `seed`.
 *
 * At xs (24px) the marble pattern becomes muddy, so we fall back to
 * initials on a hashed primary tint — still deterministic, still
 * branded, but legible. Hybrid approach per design doc §7.1.
 */
export function UserAvatar({ seed, name, size = "md", className }: Props) {
  const px = sizePx[size]
  const label = name ? `${name}'s avatar` : "Avatar"

  if (size === "xs") {
    const initial = (name?.trim()[0] ?? "?").toUpperCase()
    // Hash to a hue, fix saturation/lightness so it always feels on-brand
    const h = cyrb53(seed) % 360
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "text-[10px] font-medium text-primary-foreground select-none",
          className
        )}
        style={{
          width: px,
          height: px,
          backgroundColor: `hsl(${h} 35% 45%)`,
        }}
      >
        {initial}
      </div>
    )
  }

  return (
    <div
      className={cn("inline-block rounded-full overflow-hidden", className)}
      role="img"
      aria-label={label}
      style={{ width: px, height: px }}
    >
      <Avatar
        size={px}
        name={seed}
        variant="marble"
        // Palette anchored on the brand. Boring Avatars uses 5 colors;
        // these are picked to sit harmoniously next to the primary umber.
        colors={["#7A4B2C", "#C8A878", "#3F7A4F", "#FBFAF7", "#5E5A53"]}
      />
    </div>
  )
}