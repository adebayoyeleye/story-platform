import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  apiDelete,
  ApiError,
  apiGet,
  apiPatchJson,
  apiPatchNoContent,
  apiPost,
  apiPut,
} from "@/api/http"
import type {
  Chapter,
  ChapterSummary,
  ContributorRole,
  StoryContributor,
  StorySummary,
} from "@/types"
import { apiGetUserByEmail } from "@/auth/authApi"
import { Container } from "@/components/layout/Container"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useToast } from "@/components/ui/ToastHost"

import { StoryHeader } from "./components/StoryHeader"
import { StorySettingsPanel } from "./components/StorySettingsPanel"
import { ContributorsPanel } from "./components/ContributorsPanel"
import { ChapterListPanel } from "./components/ChapterListPanel"
import { ChapterEditorPanel } from "./components/ChapterEditorPanel"
import { toEditorHtml } from "./components/editorContent"
import { StatsCard } from "@/features/analytics/components/StatsCard"

export function WriterStoryScreen() {
  const { storyId } = useParams()

  const toast = useToast()

  const [story, setStory] = useState<StorySummary | null>(null)
  const [chapters, setChapters] = useState<ChapterSummary[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // editor state
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // confirm switching chapters
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingChapterId, setPendingChapterId] = useState<string | null>(null)

  // meta editing
  const [editTitle, setEditTitle] = useState("")
  const [editSynopsis, setEditSynopsis] = useState("")
  const [editOwnerPenName, setEditOwnerPenName] = useState("")

  // contributors
  const [newContributorEmail, setNewContributorEmail] = useState("")
  const [newContributorRole, setNewContributorRole] =
    useState<ContributorRole>("CO_AUTHOR")
  const [newContributorPenName, setNewContributorPenName] = useState("")
  const [isAddingContributor, setIsAddingContributor] = useState(false)

  // disable publish/archive/restore while saving (and show per-row busy)
  const [chapterActionId, setChapterActionId] = useState<string | null>(null)

  const canEdit = 
  selectedChapter?.status === "DRAFT" || 
  selectedChapter?.status === "PUBLISHED"

  const nextChapterNumber = useMemo(() => {
    if (chapters.length === 0) return 1
    return Math.max(...chapters.map((c) => c.chapterNumber)) + 1
  }, [chapters])

  async function refresh() {
    if (!storyId) return
    setError(null)
    setFieldErrors({})

    try {
      const [s, list] = await Promise.all([
        apiGet<StorySummary>(`/api/v1/content/writer/stories/${storyId}`),
        apiGet<any>(
          `/api/v1/content/writer/stories/${storyId}/chapters?page=0&size=200`
        ),
      ])

      setStory(s)
      setChapters(list.content ?? [])

      // sync meta form
      setEditTitle(s.title)
      setEditSynopsis(s.synopsis ?? "")
      setEditOwnerPenName("") // until DTO includes it
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load")
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId])

  async function openChapter(chapterId: string) {
    setError(null)
    setFieldErrors({})
    try {
      const full = await apiGet<Chapter>(
        `/api/v1/content/writer/chapters/${chapterId}`
      )
      setSelectedChapter(full)
      setNewTitle(full.title)
      setNewContent(toEditorHtml(full.content, full.contentFormat))
      setIsDirty(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load chapter")
    }
  }

  function requestOpenChapter(id: string) {
    if (isDirty && canEdit) {
      setPendingChapterId(id)
      setConfirmOpen(true)
      return
    }
    openChapter(id)
  }

  async function createDraftChapter() {
    if (!storyId) return
    setError(null)
    setFieldErrors({})
    try {
      await apiPost(`/api/v1/content/writer/stories/${storyId}/chapters`, {
        title: `Chapter ${nextChapterNumber}`,
        content: "",
        // content: newContent || "<p></p>",
        contentFormat: "RICH_TEXT_HTML",
        chapterNumber: nextChapterNumber,
      })
      toast.push({ title: "Chapter created", kind: "success" })
      await refresh()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setError(err instanceof Error ? err.message : "Failed to create chapter")
      }
      toast.push({ title: "Create chapter failed", kind: "error" })
    }
  }

  async function saveChapter(publishImmediately: boolean) {
    if (!selectedChapter) return

    setError(null)
    setFieldErrors({})
    setIsSaving(true)

    try {
      const updated = await apiPut<Chapter>(
        `/api/v1/content/writer/chapters/${selectedChapter.id}`,
        { title: newTitle, content: newContent, contentFormat: "RICH_TEXT_HTML", publishImmediately }
      )

      setSelectedChapter(updated)

      setIsDirty(false)
      toast.push({ title: "Saved", kind: "success" })

      await refresh()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setError(err instanceof Error ? err.message : "Failed to save")
      }
      toast.push({ title: "Save failed", kind: "error" })
    } finally {
      setIsSaving(false)
    }
  }

  async function setChapterStatus(
    chapterId: string,
    status: "PUBLISHED" | "ARCHIVED"
  ) {
    // UX: while saving draft/autosave is happening, don't allow status changes
    if (isSaving) return

    setError(null)
    setFieldErrors({})
    setChapterActionId(chapterId)

    try {
      await apiPatchNoContent(
        `/api/v1/content/writer/chapters/${chapterId}/status?status=${status}`
      )
      toast.push({ title: `Chapter ${status.toLowerCase()}`, kind: "success" })
      await refresh()
      if (selectedChapter?.id === chapterId) setSelectedChapter(null)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to set chapter status to ${status}`
        )
      }
      toast.push({ title: "Update failed", kind: "error" })
    } finally {
      setChapterActionId(null)
    }
  }

  async function publishChapter(chapterId: string) {
    await setChapterStatus(chapterId, "PUBLISHED")
  }
  async function archiveChapter(chapterId: string) {
    await setChapterStatus(chapterId, "ARCHIVED")
  }
  async function restoreChapter(chapterId: string) {
    // restore = publish in your API
    await setChapterStatus(chapterId, "PUBLISHED")
  }

  async function updateStoryStatus(next: StorySummary["status"]) {
    if (!storyId) return
    setError(null)
    setFieldErrors({})
    try {
      const patched = await apiPatchJson<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}/status?status=${encodeURIComponent(
          next
        )}`
      )
      setStory(patched)
      toast.push({ title: "Story status updated", kind: "success" })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setError(err instanceof Error ? err.message : "Failed to update story")
      }
      toast.push({ title: "Update failed", kind: "error" })
    }
  }

  async function handleSaveMeta() {
    if (!storyId) return
    setError(null)
    setFieldErrors({})

    try {
      const payload: {
        title?: string
        synopsis?: string
        ownerPenName?: string
      } = {}

      if (editTitle.trim() !== (story?.title ?? "")) payload.title = editTitle.trim()
      if (editSynopsis !== (story?.synopsis ?? "")) payload.synopsis = editSynopsis
      if (editOwnerPenName.trim().length > 0) payload.ownerPenName = editOwnerPenName.trim()

      const updated = await apiPatchJson<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}`,
        payload
      )
      setStory(updated)
      toast.push({ title: "Saved", kind: "success" })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setError(err instanceof Error ? err.message : "Failed to update story")
      }
      toast.push({ title: "Save failed", kind: "error" })
    }
  }

  async function addContributor() {
    if (!storyId) return
    if (!newContributorEmail.trim()) return

    setError(null)
    setFieldErrors({})
    setIsAddingContributor(true)

    try {
      const user = await apiGetUserByEmail(newContributorEmail)

      const updated = await apiPost<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}/contributors`,
        {
          userId: user.id,
          role: newContributorRole,
          penName: newContributorPenName || null,
        }
      )

      setStory(updated)
      setNewContributorEmail("")
      setNewContributorPenName("")
      setNewContributorRole("CO_AUTHOR")
      toast.push({ title: "Contributor added", kind: "success" })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setError(err instanceof Error ? err.message : "Failed to add contributor")
      }
      toast.push({ title: "Add contributor failed", kind: "error" })
    } finally {
      setIsAddingContributor(false)
    }
  }

  async function updateContributor(
    userId: string,
    role?: ContributorRole,
    penName?: string | null
  ) {
    if (!storyId) return
    setError(null)
    setFieldErrors({})

    try {
      const updated = await apiPatchJson<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}/contributors/${userId}`,
        { role, penName }
      )
      setStory(updated)
      toast.push({ title: "Contributor updated", kind: "success" })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setError(err instanceof Error ? err.message : "Failed to update contributor")
      }
      toast.push({ title: "Update failed", kind: "error" })
    }
  }

  async function removeContributor(userId: string) {
    if (!storyId) return
    setError(null)
    setFieldErrors({})

    try {
      const updated = await apiDelete<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}/contributors/${userId}`
      )
      setStory(updated)
      toast.push({ title: "Contributor removed", kind: "success" })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setError(err instanceof Error ? err.message : "Failed to remove contributor")
      }
      toast.push({ title: "Remove failed", kind: "error" })
    }
  }

  // autosave (debounced) — declared unconditionally; guarded inside
  useEffect(() => {
    if (!selectedChapter) return
    if (!canEdit) return
    if (!isDirty) return

    const t = window.setTimeout(async () => {
      setIsSaving(true)
      try {
        await apiPut(`/api/v1/content/writer/chapters/${selectedChapter.id}`, {
          title: newTitle,
          content: newContent,
          contentFormat: "RICH_TEXT_HTML",
          publishImmediately: false,
        })
        setIsDirty(false)
        toast.push({ title: "Saved", kind: "success" })
      } catch {
        toast.push({ title: "Autosave failed", kind: "error" })
      } finally {
        setIsSaving(false)
      }
    }, 900)

    return () => window.clearTimeout(t)
  }, [selectedChapter, canEdit, isDirty, newTitle, newContent, toast])

  // UI (no early returns before hooks above)
  if (!storyId) {
    return (
      <Container>
        Missing story id. <Link className="text-blue-600 hover:underline" to="/write">Back</Link>
      </Container>
    )
  }

  if (!story) {
    return <Container>Loading…</Container>
  }

  return (
    <Container className="grid gap-6">
      <StoryHeader
        story={story}
        error={error}
        onChangeStatus={updateStoryStatus}
      />

      {storyId && <StatsCard contentType="STORY" contentId={storyId} />}

      <StorySettingsPanel
        byline={story.byline ?? "—"}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editSynopsis={editSynopsis}
        setEditSynopsis={setEditSynopsis}
        editOwnerPenName={editOwnerPenName}
        setEditOwnerPenName={setEditOwnerPenName}
        fieldErrors={fieldErrors}
        onSave={handleSaveMeta}
      />

      <ContributorsPanel
        contributors={(story.contributors ?? []) as StoryContributor[]}
        fieldErrors={fieldErrors}
        newContributorEmail={newContributorEmail}
        setNewContributorEmail={setNewContributorEmail}
        newContributorPenName={newContributorPenName}
        setNewContributorPenName={setNewContributorPenName}
        newContributorRole={newContributorRole}
        setNewContributorRole={setNewContributorRole}
        isAddingContributor={isAddingContributor}
        onAdd={addContributor}
        onUpdate={updateContributor}
        onRemove={removeContributor}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ChapterListPanel
          chapters={chapters}
          isSaving={isSaving}
          busyChapterId={chapterActionId}
          onNewChapter={createDraftChapter}
          onOpenChapter={requestOpenChapter}
          onPublish={publishChapter}
          onArchive={archiveChapter}
          onRestore={restoreChapter}
        />

        <ChapterEditorPanel
          storyId={storyId}
          selectedChapter={selectedChapter}
          canEdit={canEdit}
          isDirty={isDirty}
          isSaving={isSaving}
          fieldErrors={fieldErrors}
          newTitle={newTitle}
          setNewTitle={(v) => {
            setNewTitle(v)
            setIsDirty(true)
          }}
          newContent={newContent}
          setNewContent={(v) => {
            setNewContent(v)
            setIsDirty(true)
          }}
          onSaveChapter={saveChapter}
          onNewChapter={createDraftChapter}
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Discard unsaved changes?"
        description="You have unsaved edits. Continue to switch chapters and lose those changes?"
        confirmText="Discard and continue"
        cancelText="Stay"
        onCancel={() => {
          setConfirmOpen(false)
          setPendingChapterId(null)
        }}
        onConfirm={() => {
          setConfirmOpen(false)
          setIsDirty(false)
          if (pendingChapterId) openChapter(pendingChapterId)
          setPendingChapterId(null)
        }}
      />
    </Container>
  )
}
