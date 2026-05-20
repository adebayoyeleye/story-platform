# Backlog

Deferred items with a known rationale. Each item is something we
deliberately chose *not* to do yet, with the reason and a rough trigger
for revisiting it.

When an item is picked up, move its summary line to `CHANGELOG.md` under
`[Unreleased]` and delete it from here.

---

## P-NAME — Author display name surfacing

**Problem:** when a Story is created, the byline falls back to the JWT
subject (an opaque id) if the writer hasn't set a pen name. Readers see
ugly identifiers in cards, headers, and bylines.

**Shape of the fix:**
1. Auth-service exposes `GET /api/v1/auth/users/{id}/profile` returning
   `{ id, displayName, avatarUrl? }`. Display name is what the user typed
   at signup; auth ids are never user-facing.
2. Content-service either calls auth on byline computation (sync, simple)
   or caches a tiny `UserProfile` projection (async, scales).
3. Default `penName` on the first `StoryContributor` to the author's
   display name when not explicitly set.
4. Frontend Avatar / Byline components query auth profiles by id with
   SWR-style caching.

**Trigger:** before any second-writer demo, or before any byline-heavy UI
ships (homepage author chips, author profile page, multi-contributor
bylines per design doc §7.4).

**Out of scope for the fix:** username uniqueness, pen-name handles
(`@arokoverse-id`), URL slugs. Those are their own features.

---

## P-VT — View Transitions API integration

**Why deferred:** needs an integration test for the reduced-motion
short-circuit and a fallback path when `document.startViewTransition` is
unavailable (older Firefox builds). Mechanical work but easy to do
half-wrong.

**Trigger:** after reading-page redesign ships; the home→detail→read
flow is where View Transitions earn their keep.

---

## P-PRELOAD — Proper font preload via build plugin

**Why deferred:** the manual `<link rel="preload">` in `index.html`
points at a path the bundler rewrites, so the preload doesn't match
the actual font fetch. Needs a small Vite plugin to inject the hashed
URL post-build.

**Trigger:** when Lighthouse performance audit shows font-related LCP
regressions; otherwise `font-display: swap` is fine.

---

## P-FOCUS-TRAP — Real focus trap in modals

**Why deferred:** `ContentTypeChooser` traps focus via a single auto-focus
+ a Cancel button; Tab still leaks to background page. Acceptable for
launch since the modal has limited content, but should harden when we
add comments / settings / publish modals.

**Trigger:** introduction of the second non-trivial modal; do it once,
share the primitive.

---

## P-EDITOR-REFACTOR — Decompose `WriterStoryScreen`

**Why deferred:** 510-line component is too big to maintain (design doc
§6 calls this out). Plan: a `useWriterStory(storyId)` hook owns server
state + mutations, leaving the screen to compose presentation components.

**Trigger:** before adding autosave (Feature in main roadmap), since
autosave will balloon this file further.