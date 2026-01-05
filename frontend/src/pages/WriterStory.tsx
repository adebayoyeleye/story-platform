import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  apiGet,
  apiPost,
  apiPut,
  apiPatchNoContent,
  apiPatchJson,
  ApiError
} from '../api';
import type { StorySummary, ChapterSummary, Chapter } from '../types';

export default function WriterStory() {
  const { storyId } = useParams();
  const [story, setStory] = useState<StorySummary | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [error, setError] = useState<string | null>(null);

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
        apiGet<StorySummary>(`/api/v1/stories/${storyId}`),
        apiGet<any>(`/api/v1/admin/stories/${storyId}/chapters?page=0&size=200`)
      ]);
      setStory(s);
      setChapters(list.content ?? []);
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
      await apiPost(`/api/v1/stories/${storyId}/chapters`, {
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
      const full = await apiGet<Chapter>(`/api/v1/admin/chapters/${chapterId}`);
      setSelectedChapter(full);
      setNewTitle(full.title);
      setNewContent(full.content);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load chapter');
    }
  }

  async function saveDraft() {
    if (!selectedChapter) return;
    setError(null);
    setFieldErrors({});
    try {
      const updated = await apiPut<Chapter>(`/api/v1/admin/chapters/${selectedChapter.id}`, {
        title: newTitle,
        content: newContent
      });
      setSelectedChapter(updated);
      await refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save');
      }
    }
  }

  async function setChapterStatus(chapterId: string, status: 'PUBLISHED' | 'ARCHIVED') {
    setError(null);
    setFieldErrors({});
    try {
      await apiPatchNoContent(`/api/v1/chapters/${chapterId}/status?status=${status}`);
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
        `/api/v1/stories/${storyId}/status?status=${encodeURIComponent(next)}`
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

  if (!storyId) return <div className="p-5 max-w-4xl mx-auto">Missing story id</div>;
  if (!story) return <div className="p-5 max-w-4xl mx-auto">Loading...</div>;

  const canEdit = selectedChapter?.status === 'DRAFT';

  return (
    <div className="p-5 max-w-6xl mx-auto grid gap-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{story.title}</h1>
            <span className="text-xs border rounded px-2 py-1 text-gray-700">{story.status}</span>
          </div>

          <div className="text-gray-600">Author: {story.authorId}</div>

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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: chapter list */}
        <div className="border rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Chapters (Admin)</h2>
            <button className="border px-3 py-2 rounded" onClick={createDraftChapter}>
              + New Chapter
            </button>
          </div>

          {chapters.length === 0 && <div className="text-gray-600">No chapters yet.</div>}

          <div className="grid gap-2">
            {chapters
              .slice()
              .sort((a, b) => a.chapterNumber - b.chapterNumber)
              .map(ch => (
                <div key={ch.id} className="border rounded p-2 flex justify-between items-center">
                  <button className="text-left" onClick={() => openChapter(ch.id)}>
                    <div className="font-medium">Chapter {ch.chapterNumber}: {ch.title}</div>
                    <div className="text-sm text-gray-600">Status: {ch.status}</div>
                  </button>

                  {ch.status === 'DRAFT' && (
                    <button className="border px-2 py-1 rounded" onClick={() => publishChapter(ch.id)}>
                      Publish
                    </button>
                  )}

                  {ch.status === 'PUBLISHED' && (
                    <button className="border px-2 py-1 rounded" onClick={() => archiveChapter(ch.id)}>
                      Archive
                    </button>
                  )}

                  {ch.status === 'ARCHIVED' && (
                    <button className="border px-2 py-1 rounded" onClick={() => restoreChapter(ch.id)}>
                      Restore
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Right: editor */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-3">Editor</h2>

          {!selectedChapter && (
            <div className="text-gray-600">
              Select a chapter to edit, or create a new one.
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

              <input
                className="border p-2 rounded"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={!canEdit}
              />
              {fieldErrors.title && <div className="text-red-600 text-sm">{fieldErrors.title}</div>}

              <textarea
                className="border p-2 rounded"
                rows={12}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                disabled={!canEdit}
              />
              {fieldErrors.content && <div className="text-red-600 text-sm">{fieldErrors.content}</div>}

              <div className="flex gap-3">
                <button
                  className="border px-3 py-2 rounded disabled:opacity-50"
                  onClick={saveDraft}
                  disabled={!canEdit}
                >
                  Save Draft
                </button>

                <Link className="border px-3 py-2 rounded" to={`/story/${storyId}`}>
                  View Public Story
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
