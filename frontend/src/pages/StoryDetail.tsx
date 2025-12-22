import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Story } from '../types';

export default function StoryDetail() {
  const { id } = useParams(); // Get the ID from the URL
  const [story, setStory] = useState<Story | null>(null);

  useEffect(() => {
    fetch('/api/v1/stories') // Optimisation needed later: GET /api/stories/{id}
      .then(res => res.json())
      .then((data: Story[]) => {
        const found = data.find(s => s.id === id);
        setStory(found || null);
      });
  }, [id]);

  if (!story) return <div>Loading story...</div>;

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <Link to="/" className="text-gray-500 hover:underline">← Back to Library</Link>
      <h1 className="text-4xl font-bold mt-4">{story.title}</h1>
      <p className="text-xl text-gray-600 mb-8">{story.author}</p>
      
      <h3 className="text-2xl font-semibold mb-4">Chapters</h3>
      <div className="space-y-3">
        {story.chapters.map((chapter, index) => (
          <div key={index} className="p-3 border-b">
            <Link to={`/story/${id}/chapter/${index}`} className="text-lg text-blue-600 hover:underline">
               Chapter {index + 1}: {chapter.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}