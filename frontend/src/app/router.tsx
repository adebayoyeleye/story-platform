import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import StoryDetailPage from "@/pages/StoryDetailPage"
import ChapterReadPage from "@/pages/ChapterReadPage"
import WriterHomePage from "@/pages/WriterHomePage"
import WriterStoryPage from "@/pages/WriterStoryPage"
import AuthPage from "@/pages/AuthPage"
import RequireAuth from "@/auth/RequireAuth"
import { useSiteAnalytics } from "@/hooks/useSiteAnalytics"
import StandaloneReadPage from "@/pages/StandaloneReadPage"
import DiscoverTypePage from "@/pages/DiscoverTypePage"

function AnalyticsTracker() {
  useSiteAnalytics()
  return null
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stories/:storyId" element={<StoryDetailPage />} />
        <Route path="/chapters/:chapterId" element={<ChapterReadPage />} />
        <Route path="/stories/:storyId/read" element={<StandaloneReadPage />} />
        <Route path="/discover/:slug" element={<DiscoverTypePage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/write"
          element={
            <RequireAuth>
              <WriterHomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/write/stories/:storyId"
          element={
            <RequireAuth>
              <WriterStoryPage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
