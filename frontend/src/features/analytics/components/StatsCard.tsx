import { useEffect, useState } from "react"
import { getContentStats, type ContentRefType } from "@/features/analytics/analyticsApi"
import type { ContentStats } from "@/types"

type Props = {
  contentType: ContentRefType
  contentId: string
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export function StatsCard({ contentType, contentId }: Props) {
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getContentStats(contentType, contentId)
      .then((s) => { if (!cancelled) setStats(s) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load stats") })
    return () => { cancelled = true }
  }, [contentType, contentId])

  if (error) {
    return (
      <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
        Couldn't load stats
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
        Loading stats…
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card p-4">
      <div className="text-sm font-semibold mb-3">Views</div>
      <div className="grid grid-cols-4 gap-3">
        <Stat label="Total" value={formatCount(stats.total)} />
        <Stat label="24h" value={formatCount(stats.last24Hours)} />
        <Stat label="7d" value={formatCount(stats.last7Days)} />
        <Stat label="30d" value={formatCount(stats.last30Days)} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}