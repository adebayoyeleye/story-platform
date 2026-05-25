import { useEffect, useRef } from "react"
import { apiPut } from "@/api/http"
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback"
import type { SaveState } from "./components/WriterShell"

type Args = {
  chapterId: string | null
  /** Latest editor body. */
  title: string
  content: string
  /** Gate: only save when the user has actually edited. */
  isDirty: boolean
  /** Gate: archived chapters are read-only. */
  canEdit: boolean
  /** Called every time the save lifecycle changes — screen reflects it
   *  in the WriterShell top bar. */
  onState: (state: SaveState) => void
  /** Called once a save succeeds — screen clears its dirty flag. */
  onSaved: () => void
}

const DEBOUNCE_MS = 900
const STASH_PREFIX = "chapter-stash:"

/**
 * Hardened chapter autosave.
 *
 *   - Debounced 900ms after last edit (resets on every keystroke).
 *   - Three retry attempts with 1s / 4s / 16s exponential back-off
 *     before surfacing the error to the user (per design doc §6.5).
 *   - On every debounced flush, also stashes {title, content} to
 *     localStorage. Recovery on next mount is left to the screen
 *     (which knows the chapter id at mount-time); see
 *     `peekChapterStash` and `clearChapterStash` exports.
 *
 * Save is fired by an effect that depends on (title, content, isDirty,
 * canEdit, chapterId). When the user types, the parent updates content,
 * effect re-runs, scheduling a save. If they keep typing, the next
 * effect cancels the previous timer via useDebouncedCallback's cleanup.
 */
export function useChapterAutosave({
  chapterId,
  title,
  content,
  isDirty,
  canEdit,
  onState,
  onSaved,
}: Args) {
  // Track whether the most recent save was driven by user input. The
  // effect below fires on chapter-load too (state populates), but we
  // only want autosave when isDirty=true — so the gate already covers
  // it. This ref is kept for future "skip first effect" needs.
  const inFlight = useRef(false)

  // Stable retry routine. Keeps trying with backoff; on success, calls
  // onSaved + clears stash. On terminal failure, surfaces error state.
  const flush = useDebouncedCallback(async (cid: string, t: string, c: string) => {
    if (inFlight.current) return // shouldn't happen given debounce, but cheap insurance
    inFlight.current = true

    onState({ status: "saving" })

    // Stash locally before attempting network — the whole point is that
    // a crash mid-save can be recovered.
    writeStash(cid, { title: t, content: c, at: Date.now() })

    const delays = [0, 1000, 4000, 16000] // 4 attempts: immediate, then 1s, 4s, 16s
    for (let i = 0; i < delays.length; i++) {
      if (i > 0) {
        await sleep(delays[i])
      }
      try {
        await apiPut(`/api/v1/content/writer/chapters/${cid}`, {
          title: t,
          content: c,
          contentFormat: "RICH_TEXT_HTML",
          publishImmediately: false,
        })
        clearStash(cid)
        onState({ status: "saved", at: new Date() })
        onSaved()
        inFlight.current = false
        return
      } catch (err) {
        // Last attempt? Bail with error state. Otherwise loop with backoff.
        if (i === delays.length - 1) {
          const msg = err instanceof Error ? err.message : "Couldn't save"
          onState({ status: "error", message: `${msg} — retrying when you continue` })
          inFlight.current = false
          return
        }
      }
    }
  }, DEBOUNCE_MS)

  // Drive the save lifecycle. The "dirty" state is shown immediately;
  // the debounced flush moves it through saving → saved.
  useEffect(() => {
    if (!chapterId) return
    if (!canEdit) return
    if (!isDirty) return

    onState({ status: "dirty" })
    flush(chapterId, title, content)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, title, content, isDirty, canEdit])
}

// ---------- localStorage stash ----------

type Stash = { title: string; content: string; at: number }

function key(chapterId: string) {
  return STASH_PREFIX + chapterId
}

function writeStash(chapterId: string, stash: Stash) {
  try {
    localStorage.setItem(key(chapterId), JSON.stringify(stash))
  } catch {
    /* storage full or blocked — autosave still attempted */
  }
}

function clearStash(chapterId: string) {
  try {
    localStorage.removeItem(key(chapterId))
  } catch {
    /* ignore */
  }
}

/**
 * Returns a stashed unsaved-edits snapshot for this chapter, if any.
 * The screen calls this on chapter-open. If the server's content is
 * older than the stash, prompt the user to restore.
 */
export function peekChapterStash(chapterId: string): Stash | null {
  try {
    const raw = localStorage.getItem(key(chapterId))
    if (!raw) return null
    return JSON.parse(raw) as Stash
  } catch {
    return null
  }
}

export function clearChapterStash(chapterId: string) {
  clearStash(chapterId)
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}