import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
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
  ContributorRole,
  StoryContributor,
  StorySummary,
} from "@/types"
import { apiGetUserByEmail } from "@/auth/authApi"
import { Button } from "@/components/ui/Button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useToast } from "@/components/ui/ToastHost"

import { StoryHeader } from "./components/StoryHeader"
import { StorySettingsPanel } from "./components/StorySettingsPanel"
import { ContributorsPanel } from "./components/ContributorsPanel"
import { ChapterListPanel } from "./components/ChapterListPanel"
import { ChapterEditorPanel } from "./components/ChapterEditorPanel"
import { toEditorHtml } from "./components/editorContent"
import { StatsCard } from "@/features/analytics/components/StatsCard"

import { useWriterStory } from "./useWriterStory"
import { WriterShell, type SaveState } from "./components/WriterShell"
import { approxWordCount } from "@/lib/text"
import { clearChapterStash, peekChapterStash, useChapterAutosave } from "./useChapterAutosave"
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut"
import { cn } from "@/lib/cn"
import { SlideOver } from "@/components/ui/SlideOver"

export function WriterStoryScreen() {
  const { storyId } = useParams()
  const toast = useToast()

  // -------- Server state via the hook (story + chapter list) --------
  const writerStory = useWriterStory(storyId)
  const { story, chapters, loading, error: loadError } = writerStory
  const { reload, patchStory, changeStatus } = writerStory.actions

  // -------- Page-level error (separate from load error) --------
  const [pageError, setPageError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // -------- Currently-opened chapter (editor target) --------
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)

  // -------- Editor body state --------
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" })
  const [focusMode, setFocusMode] = useState(false)

  // -------- Confirm dialog for switching chapters with unsaved edits --------
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingChapterId, setPendingChapterId] = useState<string | null>(null)

  // -------- Story-meta panel state --------
  const [editTitle, setEditTitle] = useState("")
  const [editSynopsis, setEditSynopsis] = useState("")
  const [editOwnerPenName, setEditOwnerPenName] = useState("")

  // -------- Contributor add-form state --------
  const [newContributorEmail, setNewContributorEmail] = useState("")
  const [newContributorRole, setNewContributorRole] =
    useState<ContributorRole>("CO_AUTHOR")
  const [newContributorPenName, setNewContributorPenName] = useState("")
  const [isAddingContributor, setIsAddingContributor] = useState(false)

  // -------- Per-row chapter-action busy id --------
  const [chapterActionId, setChapterActionId] = useState<string | null>(null)

  const [settingsOpen, setSettingsOpen] = useState(false)

  // -------- Sync meta form when the story loads/changes --------
  useEffect(() => {
    if (!story) return
    setEditTitle(story.title)
    setEditSynopsis(story.synopsis ?? "")
    setEditOwnerPenName("")
  }, [story])

  // -------- Derived: word count for the top bar --------
  const wordCount = useMemo(
    () => approxWordCount(newContent),
    [newContent]
  )

  // -------- Derived: next chapter number --------
  const nextChapterNumber = useMemo(() => {
    if (chapters.length === 0) return 1
    return Math.max(...chapters.map((c) => c.chapterNumber)) + 1
  }, [chapters])

  // -------- Derived: can the editor accept input? --------
  const canEdit =
    selectedChapter?.status === "DRAFT" ||
    selectedChapter?.status === "PUBLISHED"

  // -------- Open a chapter into the editor --------
  async function openChapter(chapterId: string) {
    setPageError(null)
    setFieldErrors({})
    try {
      const full = await apiGet<Chapter>(
        `/api/v1/content/writer/chapters/${chapterId}`
      )
      setSelectedChapter(full)
      setNewTitle(full.title)
      setNewContent(toEditorHtml(full.content, full.contentFormat))
      setIsDirty(false)
      setSaveState({ status: "idle" })

      // Recovery prompt. Server's updatedAt vs our stash.at — newer stash
      // means there are unsaved edits from the last session.
      const stash = peekChapterStash(chapterId)
      if (stash) {
        const serverAt = full.updatedAt ? new Date(full.updatedAt).getTime() : 0
        if (stash.at > serverAt) {
          const restore = window.confirm(
            "Found unsaved changes from your last session. Restore them?\n\n" +
            "Click Cancel to keep the server's version."
          )
          if (restore) {
            setNewTitle(stash.title)
            setNewContent(stash.content)
            setIsDirty(true) // triggers an autosave once they touch the editor
          } else {
            clearChapterStash(chapterId)
          }
        } else {
          // Stash is older than server — server already has these edits.
          clearChapterStash(chapterId)
        }
      }
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : "Failed to load chapter")
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

  // -------- Create a new draft chapter --------
  async function createDraftChapter() {
    if (!storyId) return
    setPageError(null)
    setFieldErrors({})
    try {
      await apiPost(`/api/v1/content/writer/stories/${storyId}/chapters`, {
        title: `Chapter ${nextChapterNumber}`,
        content: "",
        contentFormat: "RICH_TEXT_HTML",
        chapterNumber: nextChapterNumber,
      })
      toast.push({ title: "Chapter created", kind: "success" })
      await reload()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setPageError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setPageError(err instanceof Error ? err.message : "Failed to create chapter")
      }
      toast.push({ title: "Create chapter failed", kind: "error" })
    }
  }

  // -------- Explicit save (clicked the Save button) --------
  async function saveChapter(publishImmediately: boolean) {
    if (!selectedChapter) return
    setPageError(null)
    setFieldErrors({})
    setIsSaving(true)
    setSaveState({ status: "saving" })
    try {
      const updated = await apiPut<Chapter>(
        `/api/v1/content/writer/chapters/${selectedChapter.id}`,
        {
          title: newTitle,
          content: newContent,
          contentFormat: "RICH_TEXT_HTML",
          publishImmediately,
        }
      )
      setSelectedChapter(updated)
      setIsDirty(false)
      setSaveState({ status: "saved", at: new Date() })
      toast.push({ title: "Saved", kind: "success" })
      await reload()
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to save"
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors)
      }
      setPageError(msg)
      setSaveState({ status: "error", message: msg })
      toast.push({ title: "Save failed", kind: "error" })
    } finally {
      setIsSaving(false)
    }
  }

  // -------- Chapter status transitions --------
  async function setChapterStatus(
    chapterId: string,
    status: "PUBLISHED" | "ARCHIVED"
  ) {
    if (isSaving) return
    setPageError(null)
    setFieldErrors({})
    setChapterActionId(chapterId)
    try {
      await apiPatchNoContent(
        `/api/v1/content/writer/chapters/${chapterId}/status?status=${status}`
      )
      toast.push({ title: `Chapter ${status.toLowerCase()}`, kind: "success" })
      await reload()
      if (selectedChapter?.id === chapterId) setSelectedChapter(null)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setPageError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setPageError(
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

  const publishChapter  = (id: string) => setChapterStatus(id, "PUBLISHED")
  const archiveChapter  = (id: string) => setChapterStatus(id, "ARCHIVED")
  const restoreChapter  = (id: string) => setChapterStatus(id, "PUBLISHED")

  // -------- Story-level status change (via dropdown) --------
  // Hook owns this; thin wrapper for toast + error capture.
  async function onChangeStoryStatus(next: StorySummary["status"]) {
    setPageError(null)
    setFieldErrors({})
    try {
      await changeStatus(next)
      toast.push({ title: "Story status updated", kind: "success" })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setPageError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setPageError(err instanceof Error ? err.message : "Failed to update story")
      }
      toast.push({ title: "Update failed", kind: "error" })
    }
  }

  // -------- Story-level title patch (from EditableStoryTitle) --------
  async function onChangeStoryTitle(nextTitle: string) {
    setPageError(null)
    try {
      await patchStory({ title: nextTitle })
      toast.push({ title: "Title saved", kind: "success" })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save title"
      setPageError(msg)
      toast.push({ title: msg, kind: "error" })
    }
  }

  // -------- Story meta panel save --------
  async function handleSaveMeta() {
    if (!storyId || !story) return
    setPageError(null)
    setFieldErrors({})
    try {
      const payload: {
        title?: string
        synopsis?: string
        ownerPenName?: string
      } = {}
      if (editTitle.trim() !== story.title) payload.title = editTitle.trim()
      if (editSynopsis !== (story.synopsis ?? "")) payload.synopsis = editSynopsis
      if (editOwnerPenName.trim().length > 0) {
        payload.ownerPenName = editOwnerPenName.trim()
      }
      await patchStory(payload)
      toast.push({ title: "Saved", kind: "success" })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setPageError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setPageError(err instanceof Error ? err.message : "Failed to update story")
      }
      toast.push({ title: "Save failed", kind: "error" })
    }
  }

  // -------- Contributors --------
  async function addContributor() {
    if (!storyId) return
    if (!newContributorEmail.trim()) return
    setPageError(null)
    setFieldErrors({})
    setIsAddingContributor(true)
    try {
      const user = await apiGetUserByEmail(newContributorEmail)
      await apiPost<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}/contributors`,
        {
          userId: user.id,
          role: newContributorRole,
          penName: newContributorPenName || null,
        }
      )
      setNewContributorEmail("")
      setNewContributorPenName("")
      setNewContributorRole("CO_AUTHOR")
      toast.push({ title: "Contributor added", kind: "success" })
      await reload()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setPageError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setPageError(err instanceof Error ? err.message : "Failed to add contributor")
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
    setPageError(null)
    setFieldErrors({})
    try {
      await apiPatchJson<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}/contributors/${userId}`,
        { role, penName }
      )
      toast.push({ title: "Contributor updated", kind: "success" })
      await reload()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setPageError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setPageError(err instanceof Error ? err.message : "Failed to update contributor")
      }
      toast.push({ title: "Update failed", kind: "error" })
    }
  }

  async function removeContributor(userId: string) {
    if (!storyId) return
    setPageError(null)
    setFieldErrors({})
    try {
      await apiDelete<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}/contributors/${userId}`
      )
      toast.push({ title: "Contributor removed", kind: "success" })
      await reload()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setPageError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setPageError(err instanceof Error ? err.message : "Failed to remove contributor")
      }
      toast.push({ title: "Remove failed", kind: "error" })
    }
  }

  // -------- Autosave (debounced). Guarded on isDirty so we never save
  // a chapter that the user merely opened. Cleanup cancels the pending
  // timer on next edit or unmount — no double-saves, no orphan timers. --
  useChapterAutosave({
    chapterId: selectedChapter?.id ?? null,
    title: newTitle,
    content: newContent,
    isDirty,
    canEdit,
    onState: setSaveState,
    onSaved: () => setIsDirty(false),
  })

  useKeyboardShortcut({
    modifiers: ["mod"],
    key: ".",
    handler: (e) => {
      e.preventDefault()
      setFocusMode((f) => !f)
    },
  })

  useKeyboardShortcut({
    key: "Escape",
    handler: () => {
      if (focusMode) setFocusMode(false)
    },
    enabled: focusMode,
  })

  useKeyboardShortcut({
    modifiers: ["mod"],
    key: "s",
    handler: (e) => {
      e.preventDefault() // Block the browser's save-page dialog
      if (selectedChapter && canEdit && !isSaving) {
        saveChapter(false)
      }
    },
  })

  // ============== RENDER ==============

  if (loading) {
    return (
      <WriterShell storyTitle="Loading…" saveState={{ status: "idle" }}>
        <div className="p-8 text-muted-foreground">Loading…</div>
      </WriterShell>
    )
  }

  if (loadError || !story) {
    return (
      <WriterShell storyTitle="Error" saveState={{ status: "idle" }}>
        <div className="p-8 text-error" role="alert">
          {loadError ?? "Story not found"}
        </div>
      </WriterShell>
    )
  }

  const isChaptered = story.contentType === "STORY_WITH_CHAPTERS"

  return (
    <WriterShell
      storyTitle={story.title}
      saveState={saveState}
      wordCount={wordCount}
      focusMode={focusMode}  // <-- add focusMode prop to WriterShell
      primaryAction={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </Button>
          <Button
            size="sm"
            onClick={() => saveChapter(false)}
            disabled={!selectedChapter || isSaving}
          >
            Save
          </Button>
        </>
      }
      sidebar={
        isChaptered ? (
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
        ) : undefined
      }
    >
      <div className={cn(
        "mx-auto px-6 py-10 transition-[max-width] duration-200",
        focusMode ? "max-w-4xl" : "max-w-3xl"
      )}>
        <StoryHeader
          story={story}
          error={pageError}
          onChangeStatus={onChangeStoryStatus}
          onChangeTitle={onChangeStoryTitle}
        />

        {storyId && (
          <div className="mt-6">
            <StatsCard contentType="STORY" contentId={storyId} />
          </div>
        )}

        <div className="mt-10">
          <ChapterEditorPanel
            storyId={storyId!}
            selectedChapter={selectedChapter}
            canEdit={canEdit}
            isDirty={isDirty}
            isSaving={isSaving}
            fieldErrors={fieldErrors}
            contentType={story.contentType}
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

        {/* Settings + contributors slide-over */}
        <SlideOver
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          title="Story settings"
          width="lg"
        >
          <div className="space-y-8">
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
          </div>
        </SlideOver>
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
    </WriterShell>
  )
}