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

2. Run the BackendBashcd backend/content-service
./mvnw spring-boot:run
API will be available at: http://localhost:8080/api/stories3. Run the Frontend (Coming Soon)Bashcd frontend
npm run dev
🗓 Project RoadmapSprintFocusStatusSprint 1Local Factory: Core API, React UI, Docker setup🟡 In ProgressSprint 2Cloud Pipeline: VPS setup, K8s cluster, CI/CD🔴 TodoSprint 3Features: Auth, Rich Text Editor, Chapters🔴 TodoSprint 4Ops: HTTPS, Monitoring (Grafana), Domain🔴 Todo📐 Data Model (Stories)The database stores stories as documents containing nested chapters:JSON{
  "title": "My Great Novel",
  "chapters": [
    { "title": "Chapter 1", "content": "It was a dark night..." }
  ]
}

---

# 🚀 Day 3: The Frontend Skeleton (React)

**Time Required:** ~90 Minutes
**Goal:** Create the React app, ensure it runs, and verify it can "see" your Java backend.

We are not using `create-react-app` (it's slow and deprecated). We will use **Vite** (pronounced "veet"), which is the modern standard—blazing fast and DevOps friendly.

### **Step 1: Scaffold the Frontend**
1.  Open your WSL2 terminal in the root `story-platform` folder.
2.  Run this command to create the project:
    ```bash
    npm create vite@latest frontend -- --template react-ts
    ```
    * `react-ts` means React with TypeScript. TypeScript is standard for "enterprise" code because it catches errors before you run them.

3.  Install dependencies:
    ```bash
    cd frontend
    npm install
    ```

### **Step 2: Clean the "Junk"**
Vite gives you a demo counter app. Let's delete it.
1.  Open `frontend/src/App.tsx`.
2.  Replace the entire file with this simple "Hello World":


function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Story Platform</h1>
      <p>Frontend is running!</p>
    </div>
  )
}

export default App
Step 3: Run it Locally
In the terminal (story-platform/frontend):

Bash

npm run dev
It will verify the port (usually http://localhost:5173). Open that in your browser.

Success Check: You should see "Story Platform" and "Frontend is running!".

Step 4: The Proxy Problem (CORS)
This is the most common issue in full-stack development.

Your Frontend is on port 5173.

Your Backend is on port 8080.

Browsers block them from talking by default (security).

The DevOps Fix: Configure Vite to "proxy" requests to Java. This mimics how Nginx will work in production.

Open frontend/vite.config.ts.

Update it to look like this:

TypeScript

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Point to your Java Backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
})