import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { StorySummary } from '../types';

export default function Home() {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/v1/stories?page=${page}&size=10`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load stories (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setStories(data.content ?? []);
        setHasNext(Boolean(data?.page?.totalPages ? page + 1 < data.page.totalPages : data?.totalPages ? page + 1 < data.totalPages : data?.last === false));
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load stories'))
      .finally(() => setLoading(false));
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
            <p className="text-gray-600">By {story.authorId}</p>
            <p className="mt-2 text-gray-800">{story.synopsis}</p>
          </div>
        ))}
      </div>
    </div>
  );
}