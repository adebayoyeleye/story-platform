import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Story } from '../types';

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    fetch('/api/stories')
      .then(res => res.json())
      .then(data => setStories(data));
  }, []);

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Library 📚</h1>
      <div className="grid gap-4">
        {stories.map(story => (
          <div key={story.id} className="border p-4 rounded shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold">
              <Link to={`/story/${story.id}`} className="text-blue-600 hover:underline">
                {story.title}
              </Link>
            </h2>
            <p className="text-gray-600">By {story.author}</p>
            <p className="mt-2 text-gray-800">{story.synopsis}</p>
          </div>
        ))}
      </div>
    </div>
  );
}