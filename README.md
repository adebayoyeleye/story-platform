# 📚 StoryPlatform

A cloud-native microservices platform for publishing stories.
Built as a DevOps Portfolio Project demonstrating Design, Build, Test, Deploy, and Monitoring.

## 🏗 Architecture
* **Frontend:** React (TypeScript) + Tailwind CSS
* **Backend:** Java Spring Boot 4.x
* **Database:** MongoDB (Containerized)
* **Infrastructure:** Kubernetes (K3s) on Linux VPS
* **CI/CD:** GitHub Actions

## 🚀 Getting Started

### Prerequisites
* Docker Desktop & WSL2
* Java JDK 21+
* Node.js 20+

### Local Development (The "Walking Skeleton")

**1. Start the Database**
```bash
docker-compose up -d

2. Run the Backend

cd backend/content-service
./mvnw spring-boot:run

API will be available at: http://localhost:8080/api/stories3. 

Run the Frontend (Coming Soon)

cd frontend
npm run dev

🗓 Project RoadmapSprintFocusStatus
Sprint 1Local Factory: Core API, React UI, Docker setup🟡 In Progress
Sprint 2Cloud Pipeline: VPS setup, K8s cluster, CI/CD🔴 Todo
Sprint 3Features: Auth, Rich Text Editor, Chapters🔴 Todo
Sprint 4Ops: HTTPS, Monitoring (Grafana), Domain🔴 Todo📐 

Data Model (Stories)The database stores stories as documents containing nested chapters:

{
  "title": "My Great Novel",
  "chapters": [
    { "title": "Chapter 1", "content": "It was a dark night..." }
  ]
}

---