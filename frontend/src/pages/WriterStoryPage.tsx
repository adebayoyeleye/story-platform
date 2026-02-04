import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  apiGet,
  apiPost,
  apiPut,
  apiPatchNoContent,
  apiPatchJson,
  ApiError,
  apiDelete
} from '@/api/http';
import type { StorySummary, ChapterSummary, Chapter, StoryContributor, ContributorRole } from '../types';
import { apiGetUserByEmail } from '../auth/authApi';
import { Collapsible } from '@/components/ui/Collapsible';
import { Button } from '@/components/ui/Button';
import { Container } from "@/components/layout/Container"
import { useToast } from "@/components/ui/ToastHost"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Input } from "@/components/ui/Input"


export default function WriterStory() {
  const { storyId } = useParams();
  const [story, setStory] = useState<StorySummary | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // const [newContributorUserId, setNewContributorUserId] = useState('');
  const [newContributorRole, setNewContributorRole] = useState<ContributorRole>('CO_AUTHOR');
  const [newContributorPenName, setNewContributorPenName] = useState('');

  // const [isLoading, setIsLoading] = useState(true);

  // meta editing
  const [editTitle, setEditTitle] = useState('');
  const [editSynopsis, setEditSynopsis] = useState('');
  const [editOwnerPenName, setEditOwnerPenName] = useState('');

  // contributors
  const [newContributorEmail, setNewContributorEmail] = useState('');
  const [isAddingContributor, setIsAddingContributor] = useState(false);

  const toast = useToast()

  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingChapterId, setPendingChapterId] = useState<string | null>(null)





  const nextChapterNumber = useMemo(() => {
    if (chapters.length === 0) return 1;
    return Math.max(...chapters.map(c => c.chapterNumber)) + 1;
  }, [chapters]);

  async function refresh() {
    if (!storyId) return;
    setError(null);
    setFieldErrors({});
    try {
      const [s, list] = await Promise.all([
        apiGet<StorySummary>(`/api/v1/content/writer/stories/${storyId}`),
        apiGet<any>(`/api/v1/content/writer/stories/${storyId}/chapters?page=0&size=200`)
      ]);
      setStory(s);
      setChapters(list.content ?? []);
      setEditTitle(s.title);
      setEditSynopsis(s.synopsis ?? '');
      // We can't extract ownerPenName directly from the DTO yet,
      // so we leave editOwnerPenName empty unless you later add it.
      setEditOwnerPenName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
  }

  useEffect(() => {
    refresh();
  }, [storyId]);

  async function createDraftChapter() {
    if (!storyId) return;
    setError(null);
    setFieldErrors({});
    try {
      await apiPost(`/api/v1/content/writer/stories/${storyId}/chapters`, {
        title: `Chapter ${nextChapterNumber}`,
        content: '',
        chapterNumber: nextChapterNumber
      });
      await refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create chapter');
      }
    }
  }

  async function openChapter(chapterId: string) {
    setError(null);
    setFieldErrors({});
    try {
      const full = await apiGet<Chapter>(`/api/v1/content/writer/chapters/${chapterId}`);
      setSelectedChapter(full);
      setNewTitle(full.title);
      setNewContent(full.content);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load chapter');
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


  async function saveDraft() {
    if (!selectedChapter) return;

    setError(null);
    setFieldErrors({});
    setIsSaving(true);

    try {
      const updated = await apiPut<Chapter>(
        `/api/v1/content/writer/chapters/${selectedChapter.id}`,
        { title: newTitle, content: newContent }
      );

      setSelectedChapter(updated);

      // ✅ manual save = same UX feedback as autosave
      setIsDirty(false);
      toast.push({ title: "Saved", kind: "success" });

      // Optional: refresh chapter list/statuses etc.
      await refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
      toast.push({ title: "Save failed", kind: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  async function setChapterStatus(chapterId: string, status: 'PUBLISHED' | 'ARCHIVED') {
    setError(null);
    setFieldErrors({});
    try {
      await apiPatchNoContent(`/api/v1/content/writer/chapters/${chapterId}/status?status=${status}`);
      await refresh();
      if (selectedChapter?.id === chapterId) setSelectedChapter(null);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : `Failed to set chapter status to ${status}`);
      }
    }
  }

  async function publishChapter(chapterId: string) {
    await setChapterStatus(chapterId, 'PUBLISHED');
  }

  async function archiveChapter(chapterId: string) {
    await setChapterStatus(chapterId, 'ARCHIVED');
  }

  async function restoreChapter(chapterId: string) {
    await setChapterStatus(chapterId, 'PUBLISHED');
  }

  async function updateStoryStatus(next: StorySummary['status']) {
    if (!storyId) return;
    setError(null);
    setFieldErrors({});
    try {
      const patched = await apiPatchJson<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}/status?status=${encodeURIComponent(next)}`
      );
      setStory(patched);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update story status');
      }
    }
  }

  async function addContributor() {
    if (!storyId) return;
    if (!newContributorEmail.trim()) return;

    setError(null);
    setIsAddingContributor(true);

    try {
      // 1) Look up user by email
      const user = await apiGetUserByEmail(newContributorEmail);
      // 2) Call content-service with UUID
      const updated = await apiPost<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}/contributors`,
        {
          userId: user.id,
          role: newContributorRole,
          penName: newContributorPenName || null,
        }
      );
      setStory(updated);
      setNewContributorEmail('');
      setNewContributorPenName('');
      setNewContributorRole('CO_AUTHOR');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to add contributor');
      }
    } finally {
      setIsAddingContributor(false);
    }
  }

  async function updateContributor(userId: string, role?: ContributorRole, penName?: string | null) {
    if (!storyId) return;
    setError(null);
    try {
      const updated = await apiPatchJson<StorySummary>(`/api/v1/content/writer/stories/${storyId}/contributors/${userId}`, {
        role,
        penName
      });
      setStory(updated);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update contributor');
      }
    }
  }

  async function removeContributor(userId: string) {
    if (!storyId) return;
    setError(null);
    try {
      const updated = await apiDelete<StorySummary>(
      `/api/v1/content/writer/stories/${storyId}/contributors/${userId}`
    );
    setStory(updated);
      // await refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to remove contributor');
      }
    }
  }

  async function handleSaveMeta() {
    if (!storyId) return;
    setError(null);
    try {
      const payload: {
        title?: string;
        synopsis?: string;
        ownerPenName?: string;
      } = {};

      if (editTitle.trim() !== (story?.title ?? '')) {
        payload.title = editTitle.trim();
      }
      if (editSynopsis !== (story?.synopsis ?? '')) {
        payload.synopsis = editSynopsis;
      }
      if (editOwnerPenName.trim().length > 0) {
        payload.ownerPenName = editOwnerPenName.trim();
      }

      const updated = await apiPatchJson<StorySummary>(
        `/api/v1/content/writer/stories/${storyId}`,
        payload
      );

      setStory(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update story');
    }
  }


  if (!storyId) return <Container>Missing story id</Container>;
  if (!story) return <Container>Loading...</Container>;

  const canEdit = selectedChapter?.status === 'DRAFT';

  // Autosave (debounced)
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
  }, [selectedChapter?.id, newTitle, newContent, canEdit, isDirty])


  return (
    <Container className="grid gap-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{story.title}</h1>
            <span className="text-xs border rounded px-2 py-1 text-gray-700">{story.status}</span>
          </div>

          <div className="text-gray-600">By: {story.byline ?? '—'}</div>

          <div className="mt-2 flex items-center gap-2">
            <label className="text-sm text-gray-600">Story status:</label>
            <select
              className="border rounded px-2 py-1"
              value={story.status}
              onChange={(e) => updateStoryStatus(e.target.value as StorySummary['status'])}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="ONGOING">ONGOING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {error && <div className="text-red-600 mt-3">{error}</div>}
        </div>

        <div className="flex gap-3">
          <Link to="/" className="text-blue-600 hover:underline">Library</Link>
          <Link to="/write" className="text-blue-600 hover:underline">Writer Home</Link>
        </div>
      </div>

      {/* Story meta editing */}
      <Collapsible title="Story Settings" description="Title, synopsis, and public byline">
        <h1 className="text-2xl font-semibold">Story Settings</h1>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="border rounded w-full px-3 py-2"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Synopsis</label>
          <textarea
            className="border rounded w-full px-3 py-2 min-h-[100px]"
            value={editSynopsis}
            onChange={(e) => setEditSynopsis(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Owner Pen Name
            <span className="text-xs text-gray-500 ml-2">
              (optional – affects public byline)
            </span>
          </label>
          <input
            className="border rounded w-full px-3 py-2"
            placeholder="e.g. Bayo Writes"
            value={editOwnerPenName}
            onChange={(e) => setEditOwnerPenName(e.target.value)}
          />
        </div>

        <button
          className="inline-flex items-center px-4 py-2 border rounded bg-gray-900 text-white text-sm"
          onClick={handleSaveMeta}
        >
          Save story settings
        </button>

        <p className="text-xs text-gray-600 mt-2">
          Public byline: <span className="font-medium">{story.byline ?? '—'}</span>
        </p>
      </Collapsible>

      {/* Contributors panel */}
      <section className="border rounded p-4 space-y-4">
        <h2 className="text-xl font-semibold">Contributors</h2>

        {/* Existing contributors list */}
        <div className="space-y-2">
          {(story.contributors ?? []).map((c: StoryContributor) => (
            <div
              key={c.userId}
              className="border rounded p-2 flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-medium">{c.penName ?? c.userId}</div>
                <div className="text-xs text-gray-600">
                  {c.role} • {c.userId}
                </div>
              </div>

              {c.role !== 'OWNER' && (
                <div className="flex gap-2">
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={c.role}
                    onChange={(e) =>
                      updateContributor(
                        c.userId,
                        e.target.value as ContributorRole,
                        c.penName ?? null
                      )
                    }
                  >
                    <option value="CO_AUTHOR">CO_AUTHOR</option>
                    <option value="EDITOR">EDITOR</option>
                  </select>

                  <button
                    className="border rounded px-2 py-1 text-sm"
                    onClick={() => removeContributor(c.userId)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}

          {(!story.contributors || story.contributors.length === 0) && (
            <p className="text-sm text-gray-500">No contributors yet.</p>
          )}
        </div>

        {/* Add contributor form (EMAIL-based) */}
        <Collapsible title="Add contributor" description="Invite co-authors and editors">
          <h3 className="text-sm font-semibold">Add contributor</h3>

          <div>
            <label className="block text-xs font-medium mb-1">Contributor email</label>
            <input
              className="border rounded w-full px-3 py-2 text-sm"
              placeholder="user@example.com"
              value={newContributorEmail}
              onChange={(e) => setNewContributorEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Pen name (optional)</label>
            <input
              className="border rounded w-full px-3 py-2 text-sm"
              placeholder="Used in byline if set"
              value={newContributorPenName}
              onChange={(e) => setNewContributorPenName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Role</label>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={newContributorRole}
              onChange={(e) => setNewContributorRole(e.target.value as ContributorRole)}
            >
              <option value="CO_AUTHOR">CO_AUTHOR</option>
              <option value="EDITOR">EDITOR</option>
            </select>
          </div>

          <button
            className="inline-flex items-center px-4 py-2 border rounded bg-gray-900 text-white text-sm disabled:opacity-60"
            onClick={addContributor}
            disabled={!newContributorEmail.trim() || isAddingContributor}
          >
            {isAddingContributor ? 'Adding…' : 'Add contributor'}
          </button>
        </Collapsible>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: chapter list */}
        <div className="border rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Chapters (Writer)</h2>
            <Button variant="secondary" onClick={createDraftChapter}>
              + New Chapter
            </Button>
          </div>

          {chapters.length === 0 && <div className="text-gray-600">No chapters yet.</div>}

          <div className="grid gap-2">
            {chapters
              .slice()
              .sort((a, b) => a.chapterNumber - b.chapterNumber)
              .map(ch => (
                <div key={ch.id} className="border rounded p-2 flex justify-between items-center">
                  <button className="text-left" onClick={() => requestOpenChapter(ch.id)}>
                    <div className="font-medium">Chapter {ch.chapterNumber}: {ch.title}</div>
                    <div className="text-sm text-gray-600">Status: {ch.status}</div>
                  </button>

                  {ch.status === 'DRAFT' && (
                    <Button variant="secondary" onClick={() => publishChapter(ch.id)}>
                      Publish
                    </Button>
                  )}

                  {ch.status === 'PUBLISHED' && (
                    <Button variant="secondary" onClick={() => archiveChapter(ch.id)}>
                      Archive
                    </Button>
                  )}

                  {ch.status === 'ARCHIVED' && (
                    <Button variant="secondary" onClick={() => restoreChapter(ch.id)}>
                      Restore
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Right: editor */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-3">Editor</h2>

          {!selectedChapter && (
            <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">No chapter selected</div>
              <div className="mt-1">Pick a chapter on the left, or create a new one.</div>
              <div className="mt-3">
                <Button variant="secondary" onClick={createDraftChapter}>+ New Chapter</Button>
              </div>
            </div>
          )}

          {selectedChapter && (
            <div className="grid gap-3">
              <div className="text-sm text-gray-600">
                Editing: Chapter {selectedChapter.chapterNumber} ({selectedChapter.status})
              </div>

              {!canEdit && (
                <div className="text-sm text-gray-600">
                  Published/archived chapters are read-only in Phase 1.
                </div>
              )}

              <Input
                value={newTitle}
                onChange={(e) => { setNewTitle(e.target.value); setIsDirty(true) }}
                disabled={!canEdit}
              />
              {fieldErrors.title && <div className="text-red-600 text-sm">{fieldErrors.title}</div>}

              <textarea
                className="min-h-[320px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newContent}
                onChange={(e) => { setNewContent(e.target.value); setIsDirty(true) }}
                disabled={!canEdit}
              />
              {fieldErrors.content && <div className="text-red-600 text-sm">{fieldErrors.content}</div>}

              <div className="sticky bottom-0 -mx-4 border-t bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    {isSaving ? "Saving…" : isDirty ? "Unsaved changes" : "All changes saved"}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={saveDraft} disabled={!canEdit || isSaving}>
                      Save Draft
                    </Button>
                    <Link to={`/stories/${storyId}`}>
                      <Button variant="ghost" type="button">View Public</Button>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Discard unsaved changes?"
        description="You have unsaved edits. Continue to switch chapters and lose those changes?"
        confirmText="Discard and continue"
        cancelText="Stay"
        onCancel={() => { setConfirmOpen(false); setPendingChapterId(null) }}
        onConfirm={() => {
          setConfirmOpen(false)
          setIsDirty(false)
          if (pendingChapterId) openChapter(pendingChapterId)
          setPendingChapterId(null)
        }}
      />
    </Container>
  );
}
