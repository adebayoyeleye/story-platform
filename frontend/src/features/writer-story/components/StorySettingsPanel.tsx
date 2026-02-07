import { Collapsible } from "@/components/ui/Collapsible"
import { Field } from "@/components/ui/Field"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"

type Props = {
  byline: string
  editTitle: string
  setEditTitle: (v: string) => void
  editSynopsis: string
  setEditSynopsis: (v: string) => void
  editOwnerPenName: string
  setEditOwnerPenName: (v: string) => void
  fieldErrors: Record<string, string>
  onSave: () => void
}

export function StorySettingsPanel({
  byline,
  editTitle,
  setEditTitle,
  editSynopsis,
  setEditSynopsis,
  editOwnerPenName,
  setEditOwnerPenName,
  fieldErrors,
  onSave,
}: Props) {
  return (
    <Collapsible title="Story Settings" description="Title, synopsis, and public byline">
      <div className="grid gap-3">
        <div className="text-xl font-semibold">Story Settings</div>

        <Field label="Title" error={fieldErrors.title}>
          <Input
            aria-invalid={!!fieldErrors.title}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        </Field>

        <Field label="Synopsis" error={fieldErrors.synopsis}>
          <Textarea
            aria-invalid={!!fieldErrors.synopsis}
            value={editSynopsis}
            onChange={(e) => setEditSynopsis(e.target.value)}
          />
        </Field>

        <Field label="Owner Pen Name (optional)" error={fieldErrors.ownerPenName}>
          <Input
            aria-invalid={!!fieldErrors.ownerPenName}
            placeholder="e.g. Bayo Writes"
            value={editOwnerPenName}
            onChange={(e) => setEditOwnerPenName(e.target.value)}
          />
        </Field>

        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" type="button" onClick={onSave}>
            Save story settings
          </Button>

          <div className="text-xs text-muted-foreground">
            Public byline: <span className="font-medium text-foreground">{byline}</span>
          </div>
        </div>
      </div>
    </Collapsible>
  )
}
