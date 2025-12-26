import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGet, apiPost } from '../api';
import type { StorySummary } from '../types';

export default function WriterHome() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [myStories, setMyStories] = useState<StorySummary[]>([]);
  const [loadingMine, setLoadingMine] = useState(false);

  async function loadMyStories() {
    if (!authorId) {
      setError('Enter your author id to load your stories');
      return;
    }

    setError(null);
    setLoadingMine(true);

    try {
      const page = await apiGet<{ content?: StorySummary[] }>(
        `/api/v1/stories/admin?authorId=${encodeURIComponent(authorId)}&page=0&size=50`
      );
      setMyStories(page.content ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
    } finally {
      setLoadingMine(false);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const story = await apiPost<StorySummary>('/api/v1/stories', { title, authorId, synopsis });
      nav(`/write/story/${story.id}`);
      await loadMyStories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create story');
    }
  }

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Writer Mode ✍️</h1>
        <Link to="/" className="text-blue-600 hover:underline">Back to Library</Link>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={onCreate} className="grid gap-3">
        <input
          className="border p-2 rounded"
          placeholder="Story title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Author id (temporary)"
          value={authorId}
          onChange={(e) => setAuthorId(e.target.value)}
          required
        />
        <textarea
          className="border p-2 rounded"
          placeholder="Synopsis"
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          rows={4}
        />
        <button className="border px-3 py-2 rounded">Create Story</button>
      </form>

      <div className="mt-10 border-t pt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">My Stories</h2>
          <button
            type="button"
            className="border px-3 py-2 rounded disabled:opacity-50"
            onClick={loadMyStories}
            disabled={loadingMine}
          >
            {loadingMine ? 'Loading...' : 'Load'}
          </button>
        </div>

        {myStories.length === 0 && (
          <div className="text-gray-600">No stories found for this author yet.</div>
        )}

        <div className="grid gap-2">
          {myStories.map(s => (
            <div key={s.id} className="border rounded p-3 flex justify-between items-center">
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-gray-600">{s.status}</div>
              </div>
              <button
                type="button"
                className="border px-3 py-2 rounded"
                onClick={() => nav(`/write/story/${s.id}`)}
              >
                Open
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
