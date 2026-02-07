// src/features/reader/continueReading.ts
export type ContinueReading = {
  chapterId: string
  chapterNumber?: number
  chapterTitle?: string
  updatedAt: string // ISO string
}

const key = (storyId: string) => `sr:continue:${storyId}`

export function getContinueReading(storyId: string): ContinueReading | null {
  try {
    const raw = localStorage.getItem(key(storyId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ContinueReading
    if (!parsed?.chapterId) return null
    return parsed
  } catch {
    return null
  }
}

export function setContinueReading(
  storyId: string,
  data: Omit<ContinueReading, "updatedAt">
) {
  try {
    const payload: ContinueReading = { ...data, updatedAt: new Date().toISOString() }
    localStorage.setItem(key(storyId), JSON.stringify(payload))
  } catch {
    // ignore
  }
}

export function clearContinueReading(storyId: string) {
  try {
    localStorage.removeItem(key(storyId))
  } catch {
    // ignore
  }
}
