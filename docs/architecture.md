# System Architecture

## Architectural Goal
High availability, eventual consistency for reads, strict consistency for writes.

## Core Components

### Frontend
- React 19 (TypeScript, Vite)
- Feature-based folder structure

### Backend
- Java Spring Boot (content-service)
- Layered architecture:
  Controller → Service → Repository → DTO

### Database
- MongoDB (NoSQL)
- Flexible schema for story content
- High read throughput

### Authentication (Future)
- Spring Security + JWT (Stateless) or OAuth2

### Caching (Future Scale)
- Redis for hot stories and session tokens

### CDN (Future Scale)
- S3 + CloudFront (or equivalent)

---

## Data Model Strategy

### Lazy Loading
Never fetch chapter content in list views.

### Indexing
- Index on `storyId`
- Index on `publishDate`

### Soft Deletes
Records are flagged with `deletedAt` instead of being removed.

---

## High-Level System Flow

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

---

## Key Principles
- Single Entry Point (Nginx)
- Stateless Backend
- Service Isolation
- Managed Data Layer
