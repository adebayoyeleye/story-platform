import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StoryDetail from './pages/StoryDetail';
import ChapterRead from './pages/ChapterRead';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/story/:id" element={<StoryDetail />} />
        <Route path="/chapters/:chapterId" element={<ChapterRead />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App