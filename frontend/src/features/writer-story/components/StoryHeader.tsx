import { Link } from "react-router-dom"
import type { StorySummary } from "@/types"
import { CONTENT_TYPE_META } from "@/lib/contentType"
import { EditableStoryTitle } from "./EditableStoryTitle"

type Props = {
  story: StorySummary
  error: string | null
  onChangeStatus: (next: StorySummary["status"]) => void
  onChangeTitle: (next: string) => void | Promise<void>
}

export function StoryHeader({
  story,
  error,
  onChangeStatus,
  onChangeTitle,
}: Props) {
  const typeMeta = CONTENT_TYPE_META[story.contentType]

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <EditableStoryTitle title={story.title} onCommit={onChangeTitle} />

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span
            className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted-foreground"
            title={typeMeta.description}
          >
            <span aria-hidden="true">{typeMeta.icon}</span>
            {typeMeta.label}
          </span>
          <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {story.status}
          </span>
        </div>

        <div className="mt-2 text-sm text-muted-foreground">
          By <span className="text-foreground font-medium">{story.byline ?? "—"}</span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Status:</label>
          <select
            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
            value={story.status}
            onChange={(e) => onChangeStatus(e.target.value as StorySummary["status"])}
          >
            <option value="DRAFT">DRAFT</option>
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>

        {error && (
          <div className="mt-3 text-sm text-error" role="alert">
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-3 text-sm shrink-0">
        <Link to="/" className="text-primary hover:opacity-80">
          Library
        </Link>
        <Link to="/write" className="text-primary hover:opacity-80">
          Writer home
        </Link>
      </div>
    </div>
  )
}