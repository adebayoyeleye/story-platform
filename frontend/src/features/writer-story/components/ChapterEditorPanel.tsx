import { Link } from "react-router-dom"
import type { Chapter, ContentType, } from "@/types"
import { Button } from "@/components/ui/Button"
import { Field } from "@/components/ui/Field"
import { Input } from "@/components/ui/Input"
// import { Textarea } from "@/components/ui/Textarea"
import { RichTextEditor } from "./RichTextEditor"
import { modeForContentType } from "./editorConfig"

type Props = {
  storyId: string
  selectedChapter: Chapter | null
  canEdit: boolean
  isDirty: boolean
  isSaving: boolean
  fieldErrors: Record<string, string>
  contentType: ContentType

  newTitle: string
  setNewTitle: (v: string) => void
  newContent: string
  setNewContent: (v: string) => void

  onSaveChapter: (publishImmediately: boolean) => void
  onNewChapter: () => void
}

export function ChapterEditorPanel({
  storyId,
  selectedChapter,
  canEdit,
  isDirty,
  isSaving,
  fieldErrors,
  contentType,
  newTitle,
  setNewTitle,
  newContent,
  setNewContent,
  onSaveChapter,
  onNewChapter,
}: Props) {
  const mode = modeForContentType(contentType)
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

          {!canEdit && selectedChapter?.status === "ARCHIVED" && (
            <div className="text-sm text-muted-foreground">
              Archived chapters are read-only. Restore the chapter to edit it.
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

          {/* <Field label="Chapter Content" error={fieldErrors.content}>
            <Textarea
              aria-invalid={!!fieldErrors.content}
              className="min-h-[320px]"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              disabled={!canEdit}
            />
          </Field> */}
          <Field label="Chapter Content" error={fieldErrors.content}>
            <RichTextEditor
              value={newContent}
              onChange={setNewContent}
              disabled={!canEdit}
              mode={mode}
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
                  onClick={() => onSaveChapter(false)}
                  disabled={!canEdit || isSaving}
                >
                  {selectedChapter?.status === "PUBLISHED" ? "Save edits (don't publish)" : "Save draft"}
                </Button>

                <Button
                  variant="primary"   // make the publish action visually primary
                  type="button"
                  onClick={() => onSaveChapter(true)}
                  disabled={!canEdit || isSaving}
                >
                  {selectedChapter?.status === "PUBLISHED" ? "Save & update live" : "Save & publish"}
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
