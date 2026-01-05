# System Architecture

## Architectural Goal (Phase 1)
Deliver a clean, deployable walking skeleton that demonstrates:
- separation of frontend/backend concerns
- correct REST patterns + lifecycle/status workflows
- reliable deployment automation
- stable error handling for UI display

Phase 1 prioritizes correctness and end-to-end workflow over advanced features.

---

## Core Components

### Frontend (React SPA)
- React 19 + TypeScript + Vite
- Routes:
  - Public reading flows (library, story view, chapter read)
  - Writer mode flows (create story, manage chapters)

### Backend (content-service)
- Spring Boot 4 (Java 25)
- Layered architecture:
  - Controller → Service → Repository
  - DTOs + Validation
  - Global exception handler returning consistent JSON errors

### Database (MongoDB)
- One `Story` per document
- One `Chapter` per document (avoids Mongo 16MB limit for long text)
- Indexing strategy (Phase 1):
  - Compound index on `chapters`: `(storyId, chapterNumber)` for ordered chapter retrieval

---

## High-Level System Flow

[ Browser (SPA) ]
       |
       v
[ Nginx (prod) / Vite (dev proxy) ]
   ├── Serves React static assets (prod)
   └── Proxies /api/* → content-service
              |
              v
     [ Spring Boot: content-service ]
              |
              v
           [ MongoDB ]

---

## Public vs Admin Access Model (Phase 1)
Phase 1 does not implement authentication yet. Instead it separates concerns by endpoint intent:

### Public (Reader)
- Only returns stories that are visible publicly
- Only returns chapters that are `PUBLISHED`

### Admin (Writer tools)
- Writer endpoints allow viewing drafts/archived chapters
- Story status and chapter status are managed via admin flows

Note: In Phase 2, these admin endpoints will require real authentication + roles.

---

## Data Model Overview

### Story
Fields (simplified):
- `id`, `title`, `authorId`, `synopsis`
- `status`: `DRAFT | ONGOING | COMPLETED | ARCHIVED`
- `createdAt`, `updatedAt`

Public listing returns only:
- `ONGOING`, `COMPLETED`

### Chapter
Fields:
- `id`, `storyId`
- `title`, `content`, `chapterNumber`
- `status`: `DRAFT | PUBLISHED | ARCHIVED`
- `createdAt`, `updatedAt`

Rules:
- Only `DRAFT` chapters are editable in Phase 1
- Public read returns only `PUBLISHED`

---

## Key API Principles (Phase 1)
- RESTful URIs and methods
- Pagination for list endpoints
- Consistent error shape for UI (see docs/devops.md for error contract)
- Defensive validation in backend (DTO validation + service checks)

---

## Future Architecture (Phase 2+)
- Introduce a separate `auth-service` microservice (reusable across future projects)
- Enforce roles: READER / WRITER / ADMIN via JWT validation
- Add revision-based editing for published chapters (no direct edits to `PUBLISHED`)
