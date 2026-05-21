import DOMPurify from "dompurify"

type Props = {
  /** Tiptap-rendered HTML from the poem editor. */
  html: string
}

/**
 * Poem body renderer. Per design doc §4.2 (most divergent of the four):
 *
 *   - Source Serif 4 at read-poem token (18px / 28px loose-ish)
 *   - white-space: pre-wrap on the container so leading spaces and
 *     intentional blank lines survive
 *   - Each <p> from Tiptap becomes one stanza; blank <p>'s render as
 *     visible stanza breaks via the spacing CSS below
 *   - Sanitised: poems are user-content HTML and we treat all such
 *     content the same way the rest of the app does
 *
 * Accessibility note from design doc §9.5: <br> announcements are
 * inconsistent across screen readers. Tiptap's paragraph-per-stanza
 * model + our pre-wrap container give screen readers natural stanza
 * boundaries (each <p>) without relying on <br>.
 */
export function PoemBody({ html }: Props) {
  // Sanitise on render. DOMPurify is already in dependencies; if it
  // becomes a perf concern on long poems, we can memoise on `html`,
  // but poems are short by definition.
  const clean = DOMPurify.sanitize(html)

  return (
    <div
      className="font-serif text-foreground whitespace-pre-wrap"
      style={{
        fontSize: "var(--reading-body-size, var(--text-read-poem))",
        lineHeight: "var(--text-read-poem--line-height)",
      }}
    >
      {/* The body is dangerously-set HTML but only after DOMPurify.
          Tiptap can produce <p>, <strong>, <em>, <br>; nothing more
          since the poem editor doesn't load heading/list extensions. */}
      <div
        className="[&>p]:mb-6 [&>p:last-child]:mb-0 [&>p:empty]:h-4"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </div>
  )
}