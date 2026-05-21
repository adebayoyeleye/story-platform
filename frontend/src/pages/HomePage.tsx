import { AppShell } from "@/components/layout/AppShell"
import { Container } from "@/components/layout/Container"
import { Lane } from "@/components/lanes/Lane"
import { StoryCard } from "@/components/cards/StoryCard"
import { BRAND } from "@/lib/brand"
import { CONTENT_TYPE_META, CONTENT_TYPE_ORDER } from "@/lib/contentType"
import { useDiscoveryFeed } from "@/features/discovery/useDiscoveryFeed"
import { Button } from "@/components/ui/Button"

export default function HomePage() {
  const feed = useDiscoveryFeed()

  return (
    <AppShell>
      <Hero />

      <Container className="space-y-12 mt-4 mb-16">
        {feed.loading && <FeedSkeleton />}

        {feed.error && (
          <div role="alert" className="text-error text-sm">
            {feed.error}
          </div>
        )}

        {!feed.loading && !feed.error && feed.all.length === 0 && (
          <div className="text-muted-foreground text-center py-12">
            Nothing published yet. Be the first to write something.
          </div>
        )}

        {!feed.loading &&
          !feed.error &&
          CONTENT_TYPE_ORDER.map((type) => {
            const stories = feed.byType[type]
            if (stories.length === 0) return null

            const meta = CONTENT_TYPE_META[type]
            return (
              <Lane
                key={type}
                title={pluralLabel(type)}
                subtitle={meta.description}
                // Type-filtered listing page is a placeholder route for now
                viewAllHref={`/discover/${type.toLowerCase()}`}
              >
                {stories.slice(0, 12).map((s) => (
                  <StoryCard
                    key={s.id}
                    story={s}
                  />
                ))}
              </Lane>
            )
          })}
      </Container>
    </AppShell>
  )
}

// ---------- subcomponents ----------

function Hero() {
  return (
    <section className="border-b border-border bg-surface">
      <Container className="py-12 md:py-20">
        <div className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-4">
          A quiet home for long reading
        </div>
        <h1 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight max-w-3xl mb-4">
          Serialised novels, short stories,<br className="hidden md:inline" /> articles &amp; poems — all under one roof.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-6">
          {BRAND.tagline} Independent publishing, writer-owned.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Start reading</Button>
          <Button variant="ghost">What is {BRAND.name}?</Button>
        </div>
      </Container>
    </section>
  )
}

function FeedSkeleton() {
  // Four lanes' worth of skeleton placeholders. Pulses via the global
  // animation rule; reduced-motion users see static blocks.
  return (
    <div className="space-y-12">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-7 w-40 bg-surface-muted rounded animate-pulse" />
          <div className="flex gap-4 overflow-hidden">
            {[0, 1, 2, 3, 4].map((j) => (
              <div
                key={j}
                className="w-56 md:w-64 shrink-0 space-y-2"
              >
                <div className="aspect-[3/4] bg-surface-muted rounded-md animate-pulse" />
                <div className="h-4 w-3/4 bg-surface-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-surface-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function pluralLabel(type: import("@/types").ContentType): string {
  switch (type) {
    case "STORY_WITH_CHAPTERS":
      return "Serialised stories"
    case "SHORT_STORY":
      return "Short stories"
    case "ARTICLE":
      return "Articles"
    case "POEM":
      return "Poems"
  }
}