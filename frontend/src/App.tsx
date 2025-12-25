import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StoryDetail from './pages/StoryDetail';
import ChapterRead from './pages/ChapterRead';
import WriterHome from './pages/WriterHome';
import WriterStory from './pages/WriterStory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/story/:id" element={<StoryDetail />} />
        <Route path="/chapters/:chapterId" element={<ChapterRead />} />
        <Route path="/write" element={<WriterHome />} />
        <Route path="/write/story/:storyId" element={<WriterStory />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App