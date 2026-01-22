import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { StorySummary } from '../types';
import { apiGet } from '../api';

export default function Home() {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiGet<any>(`/api/v1/content/stories?page=${page}&size=10`);
        if (cancelled) return;

        setStories(data.content ?? []);

        const totalPages =
          data?.page?.totalPages ?? data?.totalPages ?? (data?.page?.totalElements ? 1 : undefined);

        if (typeof totalPages === 'number') {
          setHasNext(page + 1 < totalPages);
        } else {
          setHasNext(data?.last === false);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load stories');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [page]);

  if (loading) return <div className="p-5 max-w-4xl mx-auto">Loading stories...</div>;
  if (error) return <div className="p-5 max-w-4xl mx-auto text-red-600">{error}</div>;

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Library 📚</h1>
        <Link to="/write" className="text-blue-600 hover:underline">Writer Mode</Link>
      </div>

      <div className="grid gap-4">
        <div className="flex gap-3 mt-6">
          <button
            className="border px-3 py-2 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Prev
          </button>
          <button
            className="border px-3 py-2 rounded disabled:opacity-50"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext}
          >
            Next
          </button>
        </div>

        {stories.length === 0 && (
          <div className="text-gray-600">No published stories yet.</div>
        )}

        {stories.map(story => (
          <div key={story.id} className="border p-4 rounded shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold">
              <Link to={`/story/${story.id}`} className="text-blue-600 hover:underline">
                {story.title}
              </Link>
            </h2>
            <p className="text-gray-600">By {story.byline}</p>
            <p className="mt-2 text-gray-800">{story.synopsis}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
