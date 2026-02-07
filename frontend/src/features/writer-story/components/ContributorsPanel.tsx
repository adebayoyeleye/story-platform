import type { ContributorRole, StoryContributor } from "@/types"
import { Collapsible } from "@/components/ui/Collapsible"
import { Field } from "@/components/ui/Field"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

type Props = {
  contributors: StoryContributor[]
  fieldErrors: Record<string, string>

  newContributorEmail: string
  setNewContributorEmail: (v: string) => void

  newContributorPenName: string
  setNewContributorPenName: (v: string) => void

  newContributorRole: ContributorRole
  setNewContributorRole: (v: ContributorRole) => void

  isAddingContributor: boolean
  onAdd: () => void
  onUpdate: (userId: string, role?: ContributorRole, penName?: string | null) => void
  onRemove: (userId: string) => void
}

export function ContributorsPanel({
  contributors,
  fieldErrors,
  newContributorEmail,
  setNewContributorEmail,
  newContributorPenName,
  setNewContributorPenName,
  newContributorRole,
  setNewContributorRole,
  isAddingContributor,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  return (
    <section className="rounded-md border bg-card p-4">
      <div className="text-xl font-semibold">Contributors</div>

      <div className="mt-3 grid gap-2">
        {contributors.length === 0 && (
          <div className="text-sm text-muted-foreground">No contributors yet.</div>
        )}

        {contributors.map((c) => (
          <div
            key={c.userId}
            className="flex items-center justify-between gap-3 rounded-md border bg-background p-2"
          >
            <div className="min-w-0">
              <div className="truncate font-medium">{c.penName ?? c.userId}</div>
              <div className="truncate text-xs text-muted-foreground">
                {c.role} • {c.userId}
              </div>
            </div>

            {c.role !== "OWNER" && (
              <div className="flex items-center gap-2">
                <select
                  className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                  value={c.role}
                  onChange={(e) =>
                    onUpdate(c.userId, e.target.value as ContributorRole, c.penName ?? null)
                  }
                >
                  <option value="CO_AUTHOR">CO_AUTHOR</option>
                  <option value="EDITOR">EDITOR</option>
                </select>

                <Button variant="ghost" type="button" onClick={() => onRemove(c.userId)}>
                  Remove
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Collapsible title="Add contributor" description="Invite co-authors and editors">
          <div className="grid gap-3">
            <Field label="Contributor email" error={fieldErrors.newContributorEmail}>
              <Input
                aria-invalid={!!fieldErrors.newContributorEmail}
                placeholder="user@example.com"
                value={newContributorEmail}
                onChange={(e) => setNewContributorEmail(e.target.value)}
              />
            </Field>

            <Field label="Pen name (optional)" error={fieldErrors.newContributorPenName}>
              <Input
                aria-invalid={!!fieldErrors.newContributorPenName}
                placeholder="Used in byline if set"
                value={newContributorPenName}
                onChange={(e) => setNewContributorPenName(e.target.value)}
              />
            </Field>

            <Field label="Role" error={fieldErrors.newContributorRole}>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newContributorRole}
                onChange={(e) => setNewContributorRole(e.target.value as ContributorRole)}
              >
                <option value="CO_AUTHOR">CO_AUTHOR</option>
                <option value="EDITOR">EDITOR</option>
              </select>
            </Field>

            <Button
              variant="secondary"
              type="button"
              onClick={onAdd}
              disabled={!newContributorEmail.trim() || isAddingContributor}
            >
              {isAddingContributor ? "Adding…" : "Add contributor"}
            </Button>
          </div>
        </Collapsible>
      </div>
    </section>
  )
}
