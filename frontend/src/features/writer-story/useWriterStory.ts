import { useCallback, useEffect, useState } from "react"
import { apiGet, apiPatchJson, apiPost } from "@/api/http"
import type {
  ChapterSummary,
  StorySummary,
} from "@/types"

export type WriterStoryState = {
  story: StorySummary | null
  chapters: ChapterSummary[]
  loading: boolean
  error: string | null
}

export type WriterStoryActions = {
  reload: () => Promise<void>
  patchStory: (patch: { title?: string; synopsis?: string; ownerPenName?: string }) => Promise<void>
  changeStatus: (next: StorySummary["status"]) => Promise<void>
  createChapter: (title: string) => Promise<ChapterSummary | null>
}

/**
 * Owns server-state and mutation handlers for one writer story session.
 *
 * Why a hook and not Redux/Zustand: this state lives for the lifetime of
 * one editor session — opening a different story is a fresh hook
 * instance. We don't need cross-route persistence, undo stacks, or
 * external subscribers; a hook is the right scope.
 *
 * Errors are exposed as a single `error` string. Field-level validation
 * errors stay inside the component using the action's rejection.
 */
export function useWriterStory(storyId: string | undefined) {
  const [state, setState] = useState<WriterStoryState>({
    story: null,
    chapters: [],
    loading: true,
    error: null,
  })

  const reload = useCallback(async () => {
    if (!storyId) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [story, chaptersPage] = await Promise.all([
        apiGet<StorySummary>(`/api/v1/content/writer/stories/${storyId}`),
        apiGet<{ content?: ChapterSummary[] }>(
          `/api/v1/content/writer/stories/${storyId}/chapters?page=0&size=200`
        ),
      ])
      setState({
        story,
        chapters: (chaptersPage.content ?? []).sort(
          (a, b) => a.chapterNumber - b.chapterNumber
        ),
        loading: false,
        error: null,
      })
    } catch (err: unknown) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load story",
      }))
    }
  }, [storyId])

  useEffect(() => {
    reload()
  }, [reload])

  const patchStory = useCallback<WriterStoryActions["patchStory"]>(
    async (patch) => {
      if (!storyId) return
      const updated = await apiPatchJson<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}`,
        patch
      )
      setState((s) => ({ ...s, story: updated }))
    },
    [storyId]
  )

  const changeStatus = useCallback<WriterStoryActions["changeStatus"]>(
    async (next) => {
      if (!storyId) return
      const updated = await apiPatchJson<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}/status?status=${encodeURIComponent(next)}`,
        {}
      )
      setState((s) => ({ ...s, story: updated }))
    },
    [storyId]
  )

  const createChapter = useCallback<WriterStoryActions["createChapter"]>(
    async (title) => {
      if (!storyId) return null
      const created = await apiPost<ChapterSummary>(
        `/api/v1/content/writer/stories/${storyId}/chapters`,
        { title }
      )
      setState((s) => ({
        ...s,
        chapters: [...s.chapters, created].sort(
          (a, b) => a.chapterNumber - b.chapterNumber
        ),
      }))
      return created
    },
    [storyId]
  )

  return {
    ...state,
    actions: { reload, patchStory, changeStatus, createChapter },
  }
}