import { Link } from "react-router-dom"
import type { StorySummary } from "@/types"

type Props = {
  story: StorySummary
  error: string | null
  onChangeStatus: (next: StorySummary["status"]) => void
}

export function StoryHeader({ story, error, onChangeStatus }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{story.title}</h1>
          <span className="rounded border px-2 py-1 text-xs text-muted-foreground">
            {story.status}
          </span>
        </div>

        <div className="mt-1 text-sm text-muted-foreground">
          By: <span className="text-foreground font-medium">{story.byline ?? "—"}</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Story status:</label>
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

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      <div className="flex gap-3 text-sm">
        <Link to="/" className="text-blue-600 hover:underline">Library</Link>
        <Link to="/write" className="text-blue-600 hover:underline">Writer Home</Link>
      </div>
    </div>
  )
}
