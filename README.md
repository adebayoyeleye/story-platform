# 📘 The Project Bible: Scalable Story Platform

**Version:** 2.0 (Holistic System Design)
**Status:** Active Development
**Stack:** React 19 (TypeScript, Vite) | Spring Boot 4 (Java 25) | MongoDB Atlas | Docker | Nginx | GitHub Actions | Oracle Cloud VM

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

* **Nginx (Production Gateway):**
  - Acts as a reverse proxy and single entry point
  - Serves the React frontend as static assets
  - Routes `/api/*` traffic to the backend service
  - Enables clean URLs, SPA routing fallback, and future HTTPS termination


### CI/CD Pipeline (The Build Factory)

We need an automated assembly line.

1. **Trigger:** Git Push to `main`.
2. **Stage 1 - Build & Test:**
* Frontend: `npm install`, `npm test`, `npm run build`.
* Backend: `mvn test`, `mvn package`.


3. **Stage 2 - Containerize:** Build Docker images and push to Registry.

4. **Stage 3 - Deploy (Automated):**
   - SSH into Oracle Cloud VM
   - Pull latest Docker images from Docker Hub
   - Restart services via `docker compose up -d`
   - Zero manual production changes


### Observability (SRE)

* **Logging:** Centralized logging (ELK Stack or simple file rotation initially).
* **Monitoring:**
  - Spring Boot Actuator (`/actuator/health`)
  - Used by Docker/Nginx for container health verification
* **Alerting:** Notification if API latency > 500ms or Error Rate > 1%.

### Environment Strategy (Dev → Prod)

The system follows a strict environment separation model.

**Development**
- Docker Compose (local)
- MongoDB container
- Vite dev server (`localhost:5173`)
- API accessed directly (`localhost:8080`)
- `SPRING_PROFILES_ACTIVE=dev`

**Production**
- Oracle Cloud Always Free VM
- Docker Compose (deployment mode)
- MongoDB Atlas (managed)
- Nginx reverse proxy (port 80)
- Single public entry point (domain → Nginx → services)
- `SPRING_PROFILES_ACTIVE=prod`

**Configuration**
- All secrets and environment-specific values are injected via `.env` files
- `application.yml` remains environment-agnostic


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

* **Infrastructure:**
  - No secrets committed to Git
  - `.env` files used per environment
  - Service names (not container names) used for internal networking
  - One Nginx config per environment (dev proxy via Vite, prod via Nginx)


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

6. Architecture Overview (NEW)
High-Level System Flow
[ User Browser ]
       |
       v
[ Nginx (Port 80) ]
   ├── Serves React Static Assets
   └── Proxies /api/* → Backend Service
              |
              v
     [ Spring Boot: content-service ]
              |
              v
        [ MongoDB Atlas ]

Key Principles

Single Entry Point: Nginx is the only public-facing service.

Service Isolation: Frontend and backend communicate only via internal Docker networking.

Stateless Backend: Enables horizontal scaling later.

Managed Data Layer: MongoDB Atlas eliminates disk persistence and backup risks.

7. Environment Strategy (Dev → Prod) (NEW)
Development Environment

Docker Compose (local)

MongoDB container

Vite Dev Server (localhost:5173)

Backend (localhost:8080)

Vite proxy forwards /api → backend

.env file for local secrets

SPRING_PROFILES_ACTIVE=dev

Production Environment

Oracle Cloud Always Free VM (Linux)

Docker Compose (deployment mode)

MongoDB Atlas (managed)

Nginx reverse proxy (port 80)

React served as static files

Backend accessed only internally

.env file injected at runtime

SPRING_PROFILES_ACTIVE=prod

Configuration Rules

No secrets committed to Git

application.yml remains environment-agnostic

All environment differences handled via .env and profiles

8. CI/CD & Deployment Model (Expanded)
Continuous Integration

Triggered on every push to main:

Checkout repository

Build & test backend (Java 25)

Build frontend (React 19 / Vite)

Build Docker images

Push images to Docker Hub

Continuous Deployment (Fully Automated)

GitHub Actions SSHs into Oracle VM

Pulls latest Docker images

Runs docker compose up -d

Old containers are replaced automatically

Zero manual production steps

Production servers never build code. They only run images.

9. Nginx: Role & Responsibilities (NEW)
Why Nginx Exists in This System

Acts as reverse proxy

Provides single public URL

Handles SPA routing fallback

Routes API calls cleanly

Future-ready for HTTPS (Let’s Encrypt)

Routing Rules

/ → React frontend

/api/* → Spring Boot backend

Internal Docker DNS resolves service names (e.g., content-service:8080)

10. Production Runbook (NEW)
Common Operations

Restart Services

docker compose up -d


View Logs

docker compose logs -f backend


Check Health

curl http://localhost/actuator/health


Rollback

docker compose pull
docker compose up -d

Failure Domains

Frontend failure → UI unavailable, API still running

Backend failure → Nginx returns 502 for /api

Database failure → backend read/write errors only

11. Non-Goals (Intentional Constraints) (NEW)

This project explicitly does not aim to:

Implement Kubernetes in early stages

Provide real-time collaboration (WebSockets)

Handle payments or monetization yet

Perform heavy content moderation via AI

Optimize for extreme global scale prematurely

Simplicity and correctness come before complexity.