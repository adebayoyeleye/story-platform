import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { StorySummary, ChapterSummary } from '../types';

export default function StoryDetail() {
  const { id } = useParams(); // Get the ID from the URL
  const [story, setStory] = useState<StorySummary | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/v1/stories/${id}`)
      .then(res => res.json())
      .then(setStory);

    fetch(`/api/v1/stories/${id}/chapters?page=0&size=200`)
      .then(res => res.json())
      .then(data => setChapters(data.content ?? []));
  }, [id]);

  if (!story) return <div>Loading story...</div>;

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <Link to="/" className="text-gray-500 hover:underline">← Back to Library</Link>
      <h1 className="text-4xl font-bold mt-4">{story.title}</h1>
      <p className="text-xl text-gray-600 mb-8">{story.authorId}</p>
      
      <h3 className="text-2xl font-semibold mb-4">Chapters</h3>
      <div className="space-y-3">
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
      </div>
    </div>
  );
}