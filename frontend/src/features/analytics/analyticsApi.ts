import { apiGet } from "@/api/http"
import type { ContentStats } from "@/types"

export type ContentRefType = "STORY" | "CHAPTER" | "PAGE"

export function getContentStats(
  contentType: ContentRefType,
  contentId: string
): Promise<ContentStats> {
  return apiGet<ContentStats>(
    `/api/v1/content/analytics/writer/content/${contentType}/${contentId}/stats`
  )
}