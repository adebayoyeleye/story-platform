import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { StorySummary, ChapterSummary } from '../types';
import { apiGet } from '../api';

export default function StoryDetail() {
  const { id } = useParams(); // Get the ID from the URL
  const [story, setStory] = useState<StorySummary | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapterPage, setChapterPage] = useState(0);
  const [chaptersHasNext, setChaptersHasNext] = useState(false);

  useEffect(() => {
  if (!id) return;
  let cancelled = false;

  (async() => {
    setLoading(true);
    setError(null);

    try {
      const storyData = await apiGet<StorySummary>(`/api/v1/content/stories/${id}`);
      const chaptersData = await apiGet<any>(`/api/v1/content/stories/${id}/chapters?page=${chapterPage}&size=50`);
      if (cancelled) return;

      setStory(storyData);
      setChapters(chaptersData.content ?? []);
      setChaptersHasNext(chaptersData?.last === false);
    } catch (e: unknown) {
      if (cancelled) return;
      setError(e instanceof Error ? e.message : 'Failed to load story');
    } finally {
      if (cancelled) return;
      setLoading(false);
    }
  })();

  return () => { cancelled = true; };
}, [id, chapterPage]);

  if (loading) return <div className="p-5 max-w-4xl mx-auto">Loading story...</div>;
  if (error) return <div className="p-5 max-w-4xl mx-auto text-red-600">{error}</div>;
  if (!story) return <div className="p-5 max-w-4xl mx-auto">Story not found.</div>;

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <Link to="/" className="text-gray-500 hover:underline">← Back to Library</Link>
      <h1 className="text-4xl font-bold mt-4">{story.title}</h1>
      <p className="text-xl text-gray-600 mb-8">{story.authorId}</p>
      
      <h3 className="text-2xl font-semibold mb-4">Chapters</h3>
      <div className="space-y-3">

        {chapters.length === 0 && (
          <div className="text-gray-600">No published chapters yet.</div>
        )}

        {chapters.map((chapter) => (
          <div key={chapter.id} className="p-3 border-b">
            <Link
              to={`/chapters/${chapter.id}`}
              className="text-lg text-blue-600 hover:underline"
            >
              Chapter {chapter.chapterNumber}: {chapter.title}
            </Link>
          </div>
        ))}

        <div className="flex gap-3 mt-6">
          <button
            className="border px-3 py-2 rounded disabled:opacity-50"
            onClick={() => setChapterPage((p) => Math.max(0, p - 1))}
            disabled={chapterPage === 0}
          >
            Prev
          </button>
          <button
            className="border px-3 py-2 rounded disabled:opacity-50"
            onClick={() => setChapterPage((p) => p + 1)}
            disabled={!chaptersHasNext}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}