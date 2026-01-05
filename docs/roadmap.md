# Master Roadmap

## Phase 1 — Walking Skeleton (Complete)
Goal: End-to-end working product with correct architecture and lifecycle flows.

Delivered:
- Public reader flows:
  - List visible stories (pagination)
  - Read published chapters only
- Writer mode (Phase 1 admin tooling):
  - Create stories (start in DRAFT)
  - List stories by authorId
  - Create/edit chapters (draft)
  - Publish chapters
  - Archive / restore chapters
  - Story status updates with transition rules enforced
- API validation + consistent JSON error responses
- Swagger UI available for API exploration
- CI/CD pipeline builds, pushes images, and deploys to Oracle VM

---

## Phase 2 — MVP Hardening + UX Overhaul (Next)
Goal: Make it feel like a real product and strengthen engineering quality.

Planned outcomes:
- Authentication & roles via separate `auth-service` microservice
- Protect writer/admin endpoints properly (JWT + roles)
- Revision-based editing for published chapters
- Mobile-first reader UI (typography, chapter nav, polish)
- Writer studio improvements (dashboard, editor UX)
- Add real unit/integration tests + CI gates (move toward TDD)

---

## Phase 3 — Discovery + Retention
- Search (title/synopsis/author) + tags/genres
- Bookmarks / “My Library”
- Notifications (follow author / new chapter)
- Basic analytics (reads per chapter)

---

## Phase 4 — Community + Moderation
- Comments
- Reporting
- Moderation queue (lean automation)

---

## Phase 5 — Creator Economy (Later)
- Tips / microtransactions
- Subscriptions (if/when traction exists)
- Author dashboards + advanced analytics
