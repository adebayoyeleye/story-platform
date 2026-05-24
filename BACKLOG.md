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

---

## P-CARD-FIELDS — Populate optional card-display fields on `StoryResponseDto`

**Why deferred:** UI tolerates undefined for `coverImageUrl`, `wordCount`,
`chapterCount`, `teaser`, `updatedAt`. Adding them server-side requires
Chapter aggregation queries that don't exist yet. For Phase 1, placeholders
cover the gap.

**Trigger:** when card meta rows start looking bare, or when we add
search/sort by length.

---

## P-LANE-API — Lane-specific story endpoints

**Why deferred:** homepage currently fetches one page and partitions
client-side. Works fine ≤ 50 items per type. Beyond that, lanes need
their own server-side queries with type filter + paging.

**Trigger:** when total stories per type approaches 50, or when any
lane needs sort-by-trending/by-new beyond stream order.

**Shape:** `GET /api/v1/content/stories?contentType=POEM&page=0&size=12`
backed by an index on `contentType`. Aggregate "trending" needs a
separate read model fed by analytics.

---

## P-SCROLL-TIMELINE — Native scroll-timeline reading-progress bar

**Why deferred:** rAF-based progress works on every browser today. Native
`scroll-timeline` is GPU-cheap but support is uneven (Safari 26+ only).
Current implementation is 15 lines and fine.

**Trigger:** when Lighthouse flags layout shift from the progress bar,
or when we want scroll-pinned animations (chapter dot indicators) that
need the same timeline.

---

## P-PUBLISH — Real publish action

**Why deferred:** current Publish button just saves the draft (status
stays DRAFT). Real publish needs:
  - confirm dialog ("This will make your work visible to everyone")
  - server-side transition Draft→Published with timestamp
  - distinct visual state for published chapters in the sidebar
  - undo within a 60s window (per design doc §6.5 retry pattern)
  - for chaptered stories: per-chapter publish, not per-work

**Trigger:** writer editor refactor (next planned feature).

---

## P-RULES-API — Server-driven content-type rules

**Why deferred:** allowed statuses per content type live in TS and Java
in parallel. Acceptable while there's one developer and the rule is
stable. Worth converging via `GET /api/v1/content/content-types` once
either source starts changing or a second developer joins.

---

## P-STATUS-MIGRATE — One-time cleanup of invalid status values

**Why deferred:** no real users yet, no need. Eventual fix: a Mongo
script that maps each Story's status against ContentType.allowedStatuses
and forces ARCHIVED for invalid combinations (or PUBLISHED for non-
chaptered ONGOING). Run once, ever.

**Trigger:** before first production deploy, if legacy data has
non-conforming statuses.

---

## P-AUTOSAVE-DEDUPE — Skip revision creation on substantively-identical saves

**Why deferred:** current autosave creates a new ContentRevision on every
debounced flush. Pause-type-pause-type → many revisions. Storage cost
grows fast for long sessions.

**Shape of fix:** server-side compare incoming content hash with the
last revision's hash; if identical, no-op the revision row but still
update the chapter's content/updatedAt. Cheap, idempotent, invisible
to the writer.

**Trigger:** the next autosave hardening pass.

---

