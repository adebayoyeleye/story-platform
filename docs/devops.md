# DevOps & SRE

## Philosophy
“Deploy early, deploy often.”

## Containerization
- Frontend and backend are containerized
- Eliminates environment drift

## Orchestration
- Docker Compose (local / dev)
- Kubernetes or ECS (future scale)

## Nginx Responsibilities
- Reverse proxy
- SPA routing fallback
- API routing
- HTTPS-ready

---

## CI/CD Pipeline

### Trigger
- Git push to `main`

### Stage 1: Build & Test
- Frontend: npm install, test, build
- Backend: mvn test, mvn package

### Stage 2: Containerize
- Build Docker images
- Push to registry

### Stage 3: Deploy
- SSH into Oracle Cloud VM
- Pull latest images
- docker compose up -d

---

## Observability

### Logging
- Centralized logging (ELK or file rotation)

### Monitoring
- Spring Boot Actuator `/actuator/health`

### Alerting
- Latency > 500ms
- Error rate > 1%
