import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Chapter } from '../types';
import { apiGet } from '../api';

export default function ChapterRead() {
  const { chapterId } = useParams();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  if (!chapterId) return;
  let cancelled = false;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Chapter>(`/api/v1/content/chapters/${chapterId}`);
      if (cancelled) return;
      setChapter(data);
    } catch (e: unknown) {
      if (cancelled) return;
      setError(e instanceof Error ? e.message : 'Failed to load chapter');
    } finally {
      if (cancelled) return;
      setLoading(false);
    }
  }

  load();
  return () => { cancelled = true; };
}, [chapterId]);

  if (loading) return <div className="p-5 max-w-3xl mx-auto">Loading chapter...</div>;
  if (error) return <div className="p-5 max-w-3xl mx-auto text-red-600">{error}</div>;
  if (!chapter) return <div className="p-5 max-w-3xl mx-auto">Chapter not found.</div>;

  return (
    <div className="p-5 max-w-3xl mx-auto font-serif leading-relaxed">
      <div className="mb-6 text-sm">
        <Link to={`/story/${chapter.storyId}`} className="text-blue-600 hover:underline">
          ← Back to Story
        </Link>
      </div>

      <h2 className="text-3xl font-bold mb-6">{chapter.title}</h2>
      <div className="text-lg whitespace-pre-wrap">{chapter.content}</div>
    </div>
  );

}