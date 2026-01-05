# Story Platform (ScribeArchitect)

A scalable story writing and consumption platform built with React, Spring Boot, and MongoDB — designed as a production-grade system and long-term portfolio project.

Phase 1 is complete: a walking skeleton that supports public reading plus a writer workflow (draft → publish → archive/restore) with consistent APIs, validation, and deployment automation.

## Tech Stack
- Frontend: React 19 (TypeScript, Vite)
- Backend: Spring Boot 4 (Java 25)
- Database: MongoDB (Docker in dev; Atlas in prod; Atlas for dev is optional)
- Infra: Docker, Nginx (prod), GitHub Actions, Oracle Cloud VM

## What’s in Phase 1
### Reader (Public)
- Browse story library (paginated)
- View story details
- Read published chapters (only)

### Writer (Admin / Phase 1)
- Create a story (starts in `DRAFT`)
- List stories by author (temporary `authorId` string until Phase 2 auth)
- Create chapters (drafts)
- Edit draft chapters
- Publish chapters
- Archive/restore chapters
- Update story status (transition rules enforced in backend)

### Status Model
**Stories**
- `DRAFT` (not visible publicly)
- `ONGOING` (visible publicly)
- `COMPLETED` (visible publicly)
- `ARCHIVED` (hidden publicly)

**Chapters**
- `DRAFT` (editable, hidden publicly)
- `PUBLISHED` (readable publicly)
- `ARCHIVED` (hidden publicly; restorable to `PUBLISHED`)

## API Quick Links
- Backend base (via nginx in prod / vite proxy in dev): `/api`
- Swagger UI (dev/prod):
  - `http://localhost:8080/api/swagger-ui/index.html`

## Local Development (Docker Compose)
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080/api`
- MongoDB (dev, if using docker): `mongodb://localhost:27017`

## Documentation
- Product Vision → `docs/vision.md`
- System Architecture → `docs/architecture.md`
- DevOps & CI/CD → `docs/devops.md`
- Roadmap → `docs/roadmap.md`
- Production Runbook → `docs/runbook.md`

## Repo Structure
- `frontend/` — React SPA
- `backend/content-service/` — Spring Boot REST API
- `docs/` — project documentation
- `.github/workflows/deploy.yml` — CI/CD pipeline
