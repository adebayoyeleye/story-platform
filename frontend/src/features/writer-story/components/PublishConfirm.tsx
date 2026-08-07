import type { StorySummary, Chapter } from "@/types"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

type Props = {
  open: boolean
  story: StorySummary
  /** For chaptered works, the chapter being published. For standalone,
   *  omit — the whole story is being published. */
  chapter?: Chapter | null
  onCancel: () => void
  onConfirm: () => void
  publishing: boolean
}

/**
 * Publish confirmation. The wording matters — writers should feel
 * calm, not startled. We say what happens plainly, no marketing gloss,
 * no scare tactics.
 */
export function PublishConfirm({
  open, story, chapter, onCancel, onConfirm, publishing,
}: Props) {
  const isChaptered = story.contentType === "STORY_WITH_CHAPTERS"

  const title = isChaptered
    ? `Publish "${chapter?.title ?? "this chapter"}"?`
    : `Publish "${story.title}"?`

  const description = isChaptered
    ? "Readers will be able to see this chapter immediately. You can archive it later to hide it again."
    : "Your work will be visible to everyone on Arokoverse. You can archive it later to hide it again."

  return (
    <ConfirmDialog
      open={open}
      title={title}
      description={description}
      confirmText={publishing ? "Publishing…" : "Publish"}
      cancelText="Not yet"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}