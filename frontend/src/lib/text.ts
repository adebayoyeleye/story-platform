/**
 * Rough word count from HTML. Strips tags, collapses whitespace,
 * splits on space. Not 100% accurate (won't dedupe weird unicode
 * whitespace, doesn't know about CJK character counting), which is
 * fine — we only ever display read-estimates rounded to nearest
 * minute. Don't use this for billing.
 */
export function approxWordCount(html: string | null | undefined): number {
  if (!html) return 0
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  if (!text) return 0
  return text.split(" ").length
}

/**
 * Conventional 250 wpm reading rate for prose. Minimum 1 minute so
 * very short pieces don't display "~0 min read".
 */
export function approxReadMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 250))
}

/**
 * Approximate line count for poems — counts non-empty lines in the
 * stripped-HTML body. Stanzas (blank lines) are deliberately not
 * counted as lines.
 */
export function approxLineCount(html: string | null | undefined): number {
  if (!html) return 0
  const text = html.replace(/<\/p>|<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "")
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0).length
}

/**
 * Plain-text teaser from HTML for card previews. Strips tags, collapses
 * whitespace, returns the first `maxChars` characters with an ellipsis
 * if truncated. Caller is responsible for sanitization upstream — this
 * function does *not* sanitize, it strips for display.
 */
export function teaserFromHtml(html: string | null | undefined, maxChars = 160): string {
  if (!html) return ""
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars).trimEnd() + "…"
}