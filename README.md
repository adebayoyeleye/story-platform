# 📘 The Project Bible: Scalable Story Platform

**Version:** 2.0 (Holistic System Design)
**Status:** Active Development
**Stack:** React (TS) | Java Spring Boot | MongoDB | Docker | CI/CD

---

## 1. Product Vision (The "Founder" & Product Manager)

**Mission:** Build a platform where stories are written, managed, and consumed with zero friction. It is not just a reader; it is an ecosystem for creators and consumers.

### User Roles & Personas

1. **The Reader:** Wants instant loading, distraction-free reading, and progress tracking.
2. **The Author:** Wants a rich text editor, chapter management, analytics (views/likes), and draft/publish controls.
3. **The Admin:** Wants user management, content moderation, and system health oversight.

### The "MVP" vs. "Full Scale"

* **MVP (Current Target):** Public reading capability, efficient data loading, basic navigation.
* **V1.5 (User Layer):** User Authentication (Login/Signup), "My Library" (bookmarks).
* **V2.0 (Creator Economy):** Author Dashboard, Write/Edit Stories, Publish workflow.

---

## 2. System Architecture (The Systems Expert)

**Goal:** High availability, eventual consistency for reads, strict consistency for writes.

### Core Components

* **Frontend:** React 19+ (TypeScript), Vite.
* *Pattern:* Feature-based folder structure.


* **Backend:** Java Spring Boot (Web).
* *Pattern:* Controller -> Service -> Repository -> DTO.


* **Database:** MongoDB (NoSQL).
* *Reasoning:* Flexible schema for story content; high read throughput.


* **Authentication (Future):** Spring Security + JWT (Stateless) or OAuth2.
* **Caching (Future Scale):** Redis. Used for caching "Hot Stories" and session tokens to reduce DB load.
* **CDN (Future Scale):** AWS S3 + CloudFront (or similar) for serving static assets (Book Covers, User Avatars).

### Data Model Strategy

* **Lazy Loading:** Never fetch `Chapter.content` in a list view.
* **Indexing:** MongoDB Indexes on `storyId` and `publishDate`.
* **Soft Deletes:** Data is rarely "deleted", only flagged as `deletedAt: timestamp` (crucial for audit/recovery).

---

## 3. DevOps & SRE (The "Ops" & Reliability Engineer)

**Philosophy:** "Deploy Early, Deploy Often." We do not wait for perfection.

### Infrastructure as Code (IaC) & Containerization

* **Docker:** Both Frontend (Nginx/Node) and Backend (JDK) must be containerized.
* *Benefit:* "It works on my machine" = "It works in production."


* **Orchestration:** Docker Compose (Local/Dev) -> Kubernetes or ECS (Production Scale).

### CI/CD Pipeline (The Build Factory)

We need an automated assembly line.

1. **Trigger:** Git Push to `main`.
2. **Stage 1 - Build & Test:**
* Frontend: `npm install`, `npm test`, `npm run build`.
* Backend: `mvn test`, `mvn package`.


3. **Stage 2 - Containerize:** Build Docker images and push to Registry.
4. **Stage 3 - Deploy:** Update the Staging/Prod environment automatically.

### Observability (SRE)

* **Logging:** Centralized logging (ELK Stack or simple file rotation initially).
* **Monitoring:** Health check endpoints (`/actuator/health` in Spring Boot).
* **Alerting:** Notification if API latency > 500ms or Error Rate > 1%.

---

## 4. Engineering & Code Standards

**Goal:** Maintainability and readability.

* **Version Control:** Conventional Commits (`feat`, `fix`, `chore`, `ci`).
* **Frontend:**
* Strict TypeScript Interfaces (shared with backend DTOs where possible via generation).
* Mobile-first responsive design (CSS Modules).


* **Backend:**
* **Layered Architecture:** strict separation of concerns.
* **DTOs:** Never expose Entity objects directly to the Controller.



---

## 5. The Master Roadmap

### ✅ Phase 1: The Prototype (Days 1-5) - [COMPLETED]

* Basic Frontend-Backend connection.
* Navigation flow (Title -> List -> Read).

### 🔄 Phase 2: DevOps Foundation (Day 6 - IMMEDIATE PRIORITY)

* **Goal:** Establish the "Walking Skeleton" pipeline.
* **Action:** Dockerize the Application (Create `Dockerfile` for Front/Back).
* **Action:** Create `docker-compose.yml` to run the full stack locally with one command.
* **Action:** Set up a basic CI pipeline (e.g., GitHub Actions) that builds on commit.

### 🚧 Phase 3: Scalability Refactor (Day 7)

* **Goal:** Fix the "Load All" data issue.
* **Action:** Backend Pagination & DTOs.
* **Action:** Frontend Lazy Loading implementation.

### 📅 Phase 4: User & Auth Foundations (Day 8-10)

* **Goal:** Know *who* is reading.
* **Action:** Spring Security Setup (JWT).
* **Action:** Frontend Login/Signup Pages.
* **Action:** User persistence in MongoDB.

### 🔮 Phase 5: The Creator Studio (Future)

* **Goal:** Allow users to become authors.
* **Action:** Markdown/Rich Text Editor implementation.
* **Action:** "My Stories" dashboard.

---