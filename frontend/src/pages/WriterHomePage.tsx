import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ApiError, apiGet, apiPost } from "@/api/http"
import type { ContentType, StorySummary } from "../types"
import { Button } from "@/components/ui/Button"
import { Container } from "@/components/layout/Container"
import { ContentTypeChooser } from "@/features/writer/ContentTypeChooser"
import { CONTENT_TYPE_META } from "@/lib/contentType"
import { AppShell } from "@/components/layout/AppShell"

export default function WriterHome() {
  const nav = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [myStories, setMyStories] = useState<StorySummary[]>([])
  const [loadingMine, setLoadingMine] = useState(false)
  const [chooserOpen, setChooserOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const loadMyStories = useCallback(async () => {
    setError(null)
    setLoadingMine(true)
    try {
      const page = await apiGet<{ content?: StorySummary[] }>(
        `/api/v1/content/writer/stories?page=0&size=50`
      )
      setMyStories(page.content ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load stories")
    } finally {
      setLoadingMine(false)
    }
  }, [])

  useEffect(() => {
    loadMyStories()
  }, [loadMyStories])

  async function handleChoose(type: ContentType) {
    setChooserOpen(false)
    setCreating(true)
    setError(null)

    try {
      // Minimal placeholder. The writer renames it in the editor.
      // Synopsis is optional and stays empty until they fill it.
      const story = await apiPost<StorySummary>(
        "/api/v1/content/writer/stories",
        {
          title: "Untitled",
          synopsis: "",
          contentType: type,
        }
      )
      nav(`/write/stories/${story.id}`)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(err instanceof Error ? err.message : "Failed to create work")
      }
      setCreating(false)
    }
  }

  return (
    <AppShell>
      <Container>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-error/30 bg-error/10 text-error px-4 py-2 text-sm"
          >
            {error}
          </div>
        )}

        <div className="mb-8">
          <Button
            onClick={() => setChooserOpen(true)}
            disabled={creating}
          >
            {creating ? "Creating…" : "+ New work"}
          </Button>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All works</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMyStories}
              disabled={loadingMine}
            >
              {loadingMine ? "Loading…" : "Refresh"}
            </Button>
          </div>

          {myStories.length === 0 && !loadingMine && (
            <div className="text-muted-foreground">
              No works yet. Click <strong>+ New work</strong> to start something.
            </div>
          )}

          <div className="grid gap-2">
            {myStories.map((s) => {
              const meta = CONTENT_TYPE_META[s.contentType]
              return (
                <div
                  key={s.id}
                  className="border border-border rounded-md p-3 flex justify-between items-center hover:bg-surface-muted transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.title}</div>
                    <div className="text-sm text-muted-foreground">
                      <span aria-hidden="true">{meta.icon}</span>{" "}
                      {meta.label} · {s.status}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => nav(`/write/stories/${s.id}`)}
                  >
                    Open
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

        <ContentTypeChooser
          open={chooserOpen}
          onClose={() => setChooserOpen(false)}
          onChoose={handleChoose}
        />
      </Container>
    </AppShell>
  )
}