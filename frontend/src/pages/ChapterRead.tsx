import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Story } from '../types';

export default function ChapterRead() {
  const { id, index } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const chapterIndex = Number(index);

  useEffect(() => {
    fetch('/api/stories')
      .then(res => res.json())
      .then((data: Story[]) => {
        const found = data.find(s => s.id === id);
        setStory(found || null);
      });
  }, [id]);

  if (!story || !story.chapters[chapterIndex]) return <div>Loading chapter...</div>;

  const chapter = story.chapters[chapterIndex];

  return (
    <div className="p-5 max-w-3xl mx-auto font-serif leading-relaxed">
      <div className="mb-6 text-sm">
        <Link to={`/story/${id}`} className="text-blue-600 hover:underline">← Back to {story.title}</Link>
      </div>
      
      <h2 className="text-3xl font-bold mb-6">{chapter.title}</h2>
      <div className="text-lg whitespace-pre-wrap">
        {chapter.content}
      </div>
    </div>
  );
}