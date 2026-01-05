# Product Vision

## Mission
Build a platform where stories are written, managed, and consumed with minimal friction.
This is both a real product direction and a portfolio-quality system demonstrating modern full-stack + DevOps practices.

---

## Core Roles

### Reader
Needs:
- clean typography and fast loading
- simple chapter navigation
- discoverability over time (Phase 2+)

### Writer
Needs:
- easy story + chapter management
- a draft/publish workflow that prevents mistakes
- an editor that feels good to use

### Admin (Later)
Needs:
- moderation tools
- system oversight

---

## Phase 1 (Completed)
A walking skeleton focused on:
- public reading flows (library → story → chapter)
- writer mode: create stories and chapters, publish/archive/restore
- status workflows:
  - Story: DRAFT / ONGOING / COMPLETED / ARCHIVED
  - Chapter: DRAFT / PUBLISHED / ARCHIVED
- strong validation + consistent API errors
- automated deployment pipeline to Oracle VM

---

## Phase 2 (Next)
Primary focus:
1. **Authentication + roles** (implemented as a separate reusable microservice)
2. **Revision-based chapter editing** (published chapters aren’t directly edited)
3. **UI/UX overhaul**
   - mobile-first reader experience
   - tablet/desktop writer studio experience
4. **Testing discipline**
   - unit + integration tests
   - CI gates
   - move toward TDD for critical domain rules

---

## Product Principles
- Readers should never see half-edited content
- Writers should not be able to accidentally “break” published work
- Keep APIs clean and stable; version changes deliberately
- Ship iteratively: build → measure → improve
