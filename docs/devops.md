# DevOps & SRE

## Philosophy
“Deploy early, deploy often.”
Keep the system small, observable, and easy to ship as a solo builder.

---

## Environments

### Dev
- Frontend: Vite dev server
- Backend: Spring Boot container
- MongoDB: Docker container (optionally Atlas)
- Compose stack for local iteration

### Production
- Deployed to Oracle Cloud VM using Docker Compose
- Nginx as reverse proxy + static asset server
- Images are built and pushed via GitHub Actions

---

## CI/CD Pipeline (Current)

### Trigger
- Push to `main`

### Workflow File
- `.github/workflows/deploy.yml`

### Stages
1. **Build Backend**
   - Uses Maven cache
   - Current build command:
     - `./mvnw clean package -DskipTests`
2. **Build Frontend**
   - Uses npm cache + `npm ci`
   - `npm run build`
3. **Build & Push Docker Images**
   - Docker Buildx
   - Pushes to Docker Hub:
     - `adebayoyeleye/story-content-service:latest`
     - `adebayoyeleye/story-frontend:latest`
4. **Deploy to Oracle VM**
   - SSH into VM
   - Pull images + recreate containers
   - Reload nginx
   - Prune images to prevent disk fill-up

---

## Deployment Notes
- Current prod tags use `latest`
  - This is fine for Phase 1
  - Phase 2 should move to immutable tags (commit SHA) to support clean rollback.

---

## Observability (Phase 1)

### Logging
- Application logs via Docker logs
- Validation errors should not spam stack traces

### Health Checks
- Spring Boot Actuator available (where enabled)
- Nginx can be configured for upstream health checks (Phase 2 hardening)

---

## Error Contract (Important for UI)
Backend returns consistent JSON errors via `GlobalExceptionHandler`:

Example shape:
```json
{
  "timestamp": "2026-01-04T00:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/stories",
  "fieldErrors": {
    "title": "Title is required",
    "authorId": "Author ID is required"
  }
}

Frontend parses this into ApiError and displays:

message (top-level)

fieldErrors under each field

Phase 2 DevOps Upgrades (Planned)

Run tests in CI (remove -DskipTests)

Add linting gates (frontend + backend)

Add integration tests (Testcontainers Mongo)

Use immutable image tags + rollback-friendly deploy

Add correlation IDs across services (especially once auth-service is added)

