import type { ChapterSummary } from "@/types"
import { Button } from "@/components/ui/Button"
import { StatsCard } from "@/features/analytics/components/StatsCard"

type Props = {
  chapters: ChapterSummary[]
  isSaving: boolean
  busyChapterId: string | null
  onNewChapter: () => void
  onOpenChapter: (id: string) => void
  onPublish: (id: string) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
}

export function ChapterListPanel({
  chapters,
  isSaving,
  busyChapterId,
  onNewChapter,
  onOpenChapter,
  onPublish,
  onArchive,
  onRestore,
}: Props) {
  const sorted = chapters.slice().sort((a, b) => a.chapterNumber - b.chapterNumber)

  return (
    <section className="rounded-md border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xl font-semibold">Chapters</div>
        <Button variant="secondary" type="button" onClick={onNewChapter} disabled={isSaving}>
          + New Chapter
        </Button>
      </div>

      {sorted.length === 0 && (
        <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
          No chapters yet.
        </div>
      )}

      <div className="grid gap-2">
        {sorted.map((ch) => {
          const rowBusy = busyChapterId === ch.id
          const disableActions = isSaving || rowBusy

          return (
            <div
              key={ch.id}
              className="flex items-center justify-between gap-3 rounded-md border bg-background p-2"
            >
              <button className="min-w-0 text-left" onClick={() => onOpenChapter(ch.id)}>
                <div className="truncate font-medium">
                  Chapter {ch.chapterNumber}: {ch.title}
                </div>
                <div className="text-sm text-muted-foreground">Status: {ch.status}</div>
              </button>

              {/* inside the chapter row's render */}
              <StatsCard contentType="CHAPTER" contentId={ch.id} />

              <div className="flex items-center gap-2">
                {ch.status === "DRAFT" && (
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={disableActions}
                    onClick={() => onPublish(ch.id)}
                  >
                    {rowBusy ? "Publishing…" : "Publish"}
                  </Button>
                )}

                {ch.status === "PUBLISHED" && (
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={disableActions}
                    onClick={() => onArchive(ch.id)}
                  >
                    {rowBusy ? "Archiving…" : "Archive"}
                  </Button>
                )}

                {ch.status === "ARCHIVED" && (
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={disableActions}
                    onClick={() => onRestore(ch.id)}
                  >
                    {rowBusy ? "Restoring…" : "Restore"}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isSaving && (
        <div className="mt-3 text-xs text-muted-foreground">
          Saving in progress… chapter actions are temporarily disabled.
        </div>
      )}
    </section>
  )
}
