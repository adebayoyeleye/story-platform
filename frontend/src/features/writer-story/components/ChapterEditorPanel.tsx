import { Link } from "react-router-dom"
import type { Chapter } from "@/types"
import { Button } from "@/components/ui/Button"
import { Field } from "@/components/ui/Field"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"

type Props = {
  storyId: string
  selectedChapter: Chapter | null
  canEdit: boolean
  isDirty: boolean
  isSaving: boolean
  fieldErrors: Record<string, string>

  newTitle: string
  setNewTitle: (v: string) => void
  newContent: string
  setNewContent: (v: string) => void

  onSaveDraft: () => void
  onNewChapter: () => void
}

export function ChapterEditorPanel({
  storyId,
  selectedChapter,
  canEdit,
  isDirty,
  isSaving,
  fieldErrors,
  newTitle,
  setNewTitle,
  newContent,
  setNewContent,
  onSaveDraft,
  onNewChapter,
}: Props) {
  return (
    <section className="rounded-md border bg-card p-4">
      <div className="mb-3 text-xl font-semibold">Editor</div>

      {!selectedChapter && (
        <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">No chapter selected</div>
          <div className="mt-1">Pick a chapter on the left, or create a new one.</div>
          <div className="mt-3">
            <Button variant="secondary" type="button" onClick={onNewChapter}>
              + New Chapter
            </Button>
          </div>
        </div>
      )}

      {selectedChapter && (
        <div className="grid gap-3">
          <div className="text-sm text-muted-foreground">
            Editing: Chapter {selectedChapter.chapterNumber} ({selectedChapter.status})
          </div>

          {!canEdit && (
            <div className="text-sm text-muted-foreground">
              Published/archived chapters are read-only in Phase 1.
            </div>
          )}

          <Field label="Chapter Title" error={fieldErrors.title}>
            <Input
              aria-invalid={!!fieldErrors.title}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={!canEdit}
            />
          </Field>

          <Field label="Chapter Content" error={fieldErrors.content}>
            <Textarea
              aria-invalid={!!fieldErrors.content}
              className="min-h-[320px]"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              disabled={!canEdit}
            />
          </Field>

          <div className="sticky bottom-0 -mx-4 border-t bg-card px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {isSaving ? "Saving…" : isDirty ? "Unsaved changes" : "All changes saved"}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={onSaveDraft}
                  disabled={!canEdit || isSaving}
                >
                  Save Draft
                </Button>

                <Link to={`/stories/${storyId}`}>
                  <Button variant="ghost" type="button">
                    View Public
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
