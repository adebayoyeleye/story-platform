import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Chapter } from '../types';

export default function ChapterRead() {
  const { chapterId } = useParams();
  const [chapter, setChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    if (!chapterId) return;

    fetch(`/api/v1/chapters/${chapterId}`)
      .then(res => res.json())
      .then(setChapter);
  }, [chapterId]);


  if (!chapter) return <div>Loading chapter...</div>;

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