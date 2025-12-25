import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../api';
import type { StorySummary } from '../types';

export default function WriterHome() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const story = await apiPost<StorySummary>('/api/v1/stories', { title, authorId, synopsis });
      nav(`/write/story/${story.id}`);
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
    </div>
  );
}
