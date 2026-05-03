import { useEffect } from "react"
import { apiPost } from "@/api/http"
import { getSessionId } from "@/lib/session"

const VIEWED_KEY_PREFIX = "sp_viewed_"
const DEDUP_WINDOW_MS = 60 * 60 * 1000  // 1 hour

function shouldRecord(contentId: string): boolean {
  const key = VIEWED_KEY_PREFIX + contentId
  const last = sessionStorage.getItem(key)
  if (last && Date.now() - Number(last) < DEDUP_WINDOW_MS) return false
  sessionStorage.setItem(key, String(Date.now()))
  return true
}

type ContentType = "STORY" | "CHAPTER"

export function usePageView(contentId: string | undefined, contentType: ContentType) {
  useEffect(() => {
    if (!contentId) return
    if (!shouldRecord(contentId)) return

    apiPost("/api/v1/content/analytics/views", {
      contentId,
      contentType,
      sessionId: getSessionId(),
    }).catch(() => {})   // swallow — never block reader on telemetry
    // }).catch((e) => console.error("[analytics]", e))   // un-swallow but log to console
  }, [contentId, contentType])
}