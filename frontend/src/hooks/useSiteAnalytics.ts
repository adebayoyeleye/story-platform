import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { apiPost } from "@/api/http"
import { getSessionId } from "@/lib/session"

export function useSiteAnalytics() {
  const location = useLocation()

  useEffect(() => {
    apiPost("/api/v1/content/analytics/views", {
      contentId: location.pathname,   // "/", "/stories/abc", etc.
      contentType: "PAGE",
      sessionId: getSessionId(),
    }).catch(() => {})
  }, [location.pathname])
}