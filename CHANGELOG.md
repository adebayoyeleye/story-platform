# Changelog

All notable changes to Arokoverse are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Pre-1.0 means the API is unstable and may break without warning. After
1.0.0 (the public launch), breaking changes require a MAJOR bump.

## [Unreleased]

### Added
- Brand identity: Arokoverse (`lib/brand.ts`) wired into AppShell + title tag
- CHANGELOG.md + SemVer adoption across `package.json` and both `pom.xml`
- `useDebouncedCallback` hook (ref-based, stable, auto-cleanup)
- `EditableStoryTitle` — auto-focus on `Untitled`, debounced save

### Changed
- `StoryService.createForAuthor` owns full creation policy (contentType
  default, OWNER seed, byline computation, save). Controller is now a
  thin transport→primitives shim.
- `StoryHeader` recomposed around the inline-editable title; status +
  content-type badges below.

### Removed
- Duplicate title input from `StorySettingsPanel` — single source of truth
  is now the headline.

## [0.2.0] - 2026-05-18

### Added
- **Design system foundation** — literary-calm palette, warm umber + cream
  surfaces, full light + dark mode tokens. (`index.css`)
- **Self-hosted fonts** — Source Serif 4 (reading) and Inter (UI) via
  `@fontsource`. No external request to Google Fonts.
- **Reading-scale typography** — separate `text-read-body`, `read-h1..h4`,
  `read-poem` token set, orthogonal to UI scale.
- **Three-tier radius scale** — `sm` / `md` (default) / `lg` / `full`.
- **Global `prefers-reduced-motion` rule** — vestibular safety baseline.
- **`ContentType` discriminator** on `Story` — `STORY_WITH_CHAPTERS`,
  `SHORT_STORY`, `ARTICLE`, `POEM`. Null-tolerant getter defaults to
  `STORY_WITH_CHAPTERS` so legacy documents round-trip without migration.
- **Content-type chooser modal** — writer-onboarding flow picks the type
  before creating; modal renders 4 choice cards with one-line descriptions.
- **Deterministic cover + avatar placeholders** — `CoverImage` (HSL
  gradient seeded from story id, optional letter watermark) and
  `UserAvatar` (Boring Avatars marble, initials-on-tint fallback at xs).
- **AppShell chrome** — sticky header with wordmark + Read/Write nav +
  light/dark theme toggle; thin footer with legal stubs. Per-page opt-in
  so the reading page can simply not use it.
- **Theme persistence + no-flash bootstrap** — `localStorage` with OS
  preference fallback, applied pre-React in `index.html`.
- **Brand identity: Arokoverse** — `lib/brand.ts` as the single source of
  truth for platform name.

### Changed
- Writer create flow: dropped the inline title/synopsis form on
  `WriterHomePage`. New flow is `+ New work` → chooser → editor.
- `WriterStoryCreateRequestDto`: optional `contentType` field added.
- `StoryResponseDto`: `contentType` added to the response shape.

### Internal
- Docs in `ContentRefType.java` clarify it's a polymorphic FK
  discriminator, distinct from `ContentType` (Story-shape discriminator).

## [0.1.0] - inherited scaffolding

Initial codebase state: React 19 + Vite + Tailwind v4 + Tiptap v3 frontend,
Spring Boot 4 microservices (auth, content), MongoDB persistence. Basic
Story / Chapter / Contributor / Revision model with anonymous session-based
page-view analytics.