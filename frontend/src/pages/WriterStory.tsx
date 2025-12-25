import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet, apiPost, apiPut, apiPatchNoContent } from '../api';
import type { StorySummary, ChapterSummary, Chapter } from '../types';

export default function WriterStory() {
  const { storyId } = useParams();
  const [story, setStory] = useState<StorySummary | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

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

  useEffect(() => { refresh(); }, [storyId]);

  async function createDraftChapter() {
    if (!storyId) return;
    setError(null);
    try {
      await apiPost(`/api/v1/stories/${storyId}/chapters`, {
        // ChapterRequestDto currently expects title/content/chapterNumber only in your frontend flow
        title: `Chapter ${nextChapterNumber}`,
        content: '',
        chapterNumber: nextChapterNumber
      });
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create chapter');
    }
  }

  async function openChapter(chapterId: string) {
    setError(null);
    try {
      // Admin read draft content
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
    try {
      const updated = await apiPut<Chapter>(`/api/v1/admin/chapters/${selectedChapter.id}`, {
        title: newTitle,
        content: newContent,
      });
      setSelectedChapter(updated);
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  }

  async function publishChapter(chapterId: string) {
    setError(null);
    try {
      await apiPatchNoContent(`/api/v1/chapters/${chapterId}/status?status=PUBLISHED`);
      await refresh();
      if (selectedChapter?.id === chapterId) {
        setSelectedChapter(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    }
  }

  if (error) {
    return <div className="p-5 max-w-4xl mx-auto text-red-600">{error}</div>;
  }

  if (!storyId) return <div className="p-5 max-w-4xl mx-auto">Missing story id</div>;
  if (!story) return <div className="p-5 max-w-4xl mx-auto">Loading...</div>;

  return (
    <div className="p-5 max-w-6xl mx-auto grid gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{story.title}</h1>
          <div className="text-gray-600">Author: {story.authorId}</div>
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

                  {ch.status !== 'PUBLISHED' && (
                    <button
                      className="border px-2 py-1 rounded"
                      onClick={() => publishChapter(ch.id)}
                    >
                      Publish
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

              <input
                className="border p-2 rounded"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              <textarea
                className="border p-2 rounded"
                rows={12}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />

              <div className="flex gap-3">
                <button className="border px-3 py-2 rounded" onClick={saveDraft}>
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
