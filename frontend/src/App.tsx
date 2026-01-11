import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StoryDetail from './pages/StoryDetail';
import ChapterRead from './pages/ChapterRead';
import WriterHome from './pages/WriterHome';
import WriterStory from './pages/WriterStory';
import AuthPage from './pages/Auth';
import RequireAuth from './auth/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/story/:id" element={<StoryDetail />} />
        <Route path="/chapters/:chapterId" element={<ChapterRead />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/write" element={<RequireAuth><WriterHome /></RequireAuth>} />
        <Route path="/write/story/:storyId" element={<RequireAuth><WriterStory /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App