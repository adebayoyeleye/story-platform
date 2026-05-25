import { Navigate, useParams } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { Container } from "@/components/layout/Container"
import { StoryCard } from "@/components/cards/StoryCard"
import { useTypeFeed } from "@/features/discovery/useDiscoveryFeed"
import { CONTENT_TYPE_META, contentTypeFromSlug } from "@/lib/contentType"

/**
 * Single-content-type browse surface. Reached from any lane's
 * "View all →" link on the homepage.
 *
 * Phase-1 scope:
 *  - Header: type label + description + count
 *  - Grid of StoryCards (the same component the homepage uses)
 *  - Skeleton + error + empty states
 *  - No filtering, no sorting — those land when there's data volume
 *    to justify them (backlog: P-DISCOVER-FILTERS).
 *
 * Layout choice: responsive grid, NOT a horizontal lane. Lanes are
 * for sampling on the homepage; the type page is for browsing — and
 * grid wins for browsing.
 */
export default function DiscoverTypePage() {
  const { slug } = useParams<{ slug: string }>()
  const type = slug ? contentTypeFromSlug(slug) : null

  // Unknown slug — bounce home rather than render a 404 banner that
  // dead-ends. The slug was probably hand-typed; sending readers back
  // to the homepage is more useful than an apology.
  if (!type) {
    return <Navigate to="/" replace />
  }

  const meta = CONTENT_TYPE_META[type]
  const { loading, error, stories } = useTypeFeed(type)

  return (
    <AppShell>
      <header className="border-b border-border bg-surface">
        <Container className="py-10 md:py-14">
          <div className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-3">
            Discover
          </div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-3">
            {pluralName(type)}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {meta.description}
          </p>
        </Container>
      </header>

      <Container className="py-10">
        {loading && <GridSkeleton />}

        {error && (
          <div role="alert" className="text-error text-sm">
            {error}
          </div>
        )}

        {!loading && !error && stories.length === 0 && (
          <div className="text-muted-foreground text-center py-16">
            Nothing here yet. Be the first.
          </div>
        )}

        {!loading && !error && stories.length > 0 && (
          <div
            // Auto-fill grid with a sensible min card width — the card
            // sizes itself, the grid just wraps. No need to know the
            // card's width here.
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            }}
          >
            {stories.map((s) => (
              // The card has its own width preference per type, but
              // the grid item fills the column. justify-self keeps the
              // card flush-left rather than stretched.
              <div key={s.id} className="justify-self-start">
                <StoryCard story={s} />
              </div>
            ))}
          </div>
        )}
      </Container>
    </AppShell>
  )
}

function GridSkeleton() {
  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
      }}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="space-y-2 w-56">
          <div className="aspect-[3/4] bg-surface-muted rounded-md animate-pulse" />
          <div className="h-4 w-3/4 bg-surface-muted rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-surface-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function pluralName(type: import("@/types").ContentType): string {
  switch (type) {
    case "STORY_WITH_CHAPTERS": return "Serialised stories"
    case "SHORT_STORY":         return "Short stories"
    case "ARTICLE":             return "Articles"
    case "POEM":                return "Poems"
  }
}