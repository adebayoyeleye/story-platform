# 📘 Project Bible: Scalable Story Platform

**Master Project Specification & Roadmap**

**Version:** 1.0 (Day 5 Complete)
**Status:** Active Development
**Stack:** React (TS) | Java Spring Boot | MongoDB

---

## 1. Product Vision (Product Manager)

**Goal:** Build a seamless, high-performance web application for reading stories and novels. The user experience centers on distraction-free reading, easy navigation, and instant content delivery.

### Core User Flows

1. **Discovery:** User lands on a generic "Library/Home" page ➔ Sees a list of available stories (Title + Cover).
2. **Selection:** User clicks a Story ➔ Sees "Story Details" (Synopsis, Author, list of Chapters).
3. **Consumption:** User clicks a Chapter ➔ Enters "Reader View" (Text content only).
4. **Navigation:** User can easily move `Previous <-> Next` between chapters or return to the `Table of Contents`.

### Design Philosophy

* **Minimalist UI:** Focus on typography and readability.
* **Performance First:** No layout shifts; fast loading times even on slow networks.
* **Accessibility:** Clear navigation cues and high contrast.

---

## 2. System Architecture (System Architect)

**Goal:** Ensure the system handles growth from 10 stories to 100,000 stories without performance degradation.

### Tech Stack

* **Frontend:** React 19+ (TypeScript).
* *Styling:* Standard CSS / CSS Modules (No Tailwind).
* *Routing:* React Router.


* **Backend:** Java Spring Boot.
* *Build Tool:* Maven/Gradle.


* **Database:** MongoDB.

### Data & Scalability Strategy

The initial "load everything" approach is deprecated. We are moving to a **Lazy Loading / Relational Pattern**.

#### Database Schema Design (Conceptual)

* **Story Collection:** Stores metadata (`id`, `title`, `author`, `coverUrl`, `description`). *Does NOT store full chapter text.*
* **Chapter Collection:** Stores content (`id`, `storyId`, `chapterNumber`, `title`, `bodyText`).
* *Index:* Compound Index on `{ storyId: 1, chapterNumber: 1 }` for fast lookups.



#### API Design (RESTful)

1. **`GET /api/stories`**
* **Behavior:** Returns list of Story Metadata only.
* **Pagination:** Supports `?page=1&limit=20`.
* **Payload:** Lightweight JSON (NO chapter text).


2. **`GET /api/stories/{id}`**
* **Behavior:** Returns Story Metadata + List of Chapter Titles/IDs.


3. **`GET /api/stories/{id}/chapters/{chapterNum}`**
* **Behavior:** Returns the heavy text content for a single chapter.



---

## 3. Engineering Guidelines

**Goal:** Maintain code quality, type safety, and consistency.

### Coding Standards

* **TypeScript:** Strict mode enabled.
* *Rule:* Use `import type { ... }` for interfaces to support isolated module compilation.


* **Styling:** Use CSS Modules (`*.module.css`) to avoid global namespace pollution.
* **Comments:** Comment complex logic, but prefer self-documenting variable names.

### Git & Version Control

* **Commit Message Format:** Conventional Commits (`type(scope): description`).
* *Example:* `feat(backend): implement DTO for story summary`
* *Example:* `fix(frontend): resolve navigation loop in reader component`



---

## 4. Agile Roadmap (Project Manager)

**Goal:** Track progress and define the "Definition of Done."

### ✅ Phase 1: Prototype (Days 1 - 5) - [COMPLETED]

* **Achievement:** Basic full-stack connection established.
* **Achievement:** Navigation logic implemented (Home -> Details -> Read).
* **Status:** Functional, but not scalable (currently loads all data at once).

### 🚧 Phase 2: Scalability Refactor (Day 6 - Current Focus)

**Objective:** Transition from "Prototype" to "Production-Ready" data fetching.

1. **Backend:** Create `StorySummaryDTO`. Refactor Controller to return DTOs for the list view.
2. **Backend:** Implement Pagination on the Repository layer (`Pageable`).
3. **Backend:** Create dedicated Endpoint for single-chapter content.
4. **Frontend:** Update Service Layer to fetch data incrementally.

### 📅 Phase 3: UI Polish & UX (Day 7+)

1. **UX:** Add "Loading..." skeletons/spinners during data fetches.
2. **UX:** Add Error Boundaries (e.g., "Failed to load chapter").
3. **UI:** Improve typography (line height, font choice) for the Reader View.

---

## 5. Next Immediate Action Items (The "Hands")

* **Backend:** Modify `StoryController.java` to stop returning full chapter lists.
* **Backend:** Create `ChapterController.java` (or add method) to serve single chapters.
* **Frontend:** Refactor `useStory` hook to accept `page` and `limit`.

---