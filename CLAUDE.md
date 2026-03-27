# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Randall** is an office desk reservation system. It uses a .NET 10 backend (Clean Architecture) with a React 19 + TypeScript frontend, served via Nginx reverse proxy in Docker.

Default admin: `admin@randall.local` / `Admin@123`

## Commands

### Backend
```bash
# Run (port 5180)
dotnet run --project src/backend/src/Randall.Api

# Unit tests
dotnet test src/backend/tests/unit/Randall.Domain.UnitTests

# Integration tests
dotnet test src/backend/tests/integration/Randall.Api.IntegrationTests

# All backend tests
dotnet test src/backend
```

### Frontend
```bash
cd src/frontend
npm run dev        # Dev server (port 5173, proxies /api → localhost:5180)
npm run build
npm run lint
```

### E2E Tests
```bash
cd tests/e2e
npx playwright test
npx playwright test --headed
npx playwright test --ui
```

### Docker
```bash
docker compose -f cicd/docker/docker-compose.yml up --build
# Runs on port 80; backend health check at :8080/health
```

## Architecture

### Backend — Clean Architecture (4 layers)

| Layer | Project | Role |
|-------|---------|------|
| API | `Randall.Api` | Controllers, JWT middleware, request/response |
| Application | `Randall.Application` | Use-case handlers, DTOs, DI registration |
| Domain | `Randall.Domain` | Entities, business rules, `Result<T>` pattern |
| Infrastructure | `Randall.Infrastructure` | EF Core, SQLite, JWT generation, password hashing |

**Key patterns:**
- **Result pattern:** `Result<T>` (railway-oriented error handling) used throughout domain and application layers.
- **Repository pattern:** interfaces in Domain, implementations in Infrastructure.
- **Handlers:** each use case has a dedicated handler class in Application (organized by feature: Admin, Auth, Reservations, Workplaces).

**Domain constraints:**
- One active reservation per employee per day
- One active reservation per workplace per day

**Database:** SQLite at `randall.db` (Docker: `/app/data/randall.db`). Migrations apply automatically on startup. Seeded with 16 workplaces + admin account on first run (skipped if DB is non-empty).

### Frontend

- **Pages:** `AuthPage`, `PlannerPage`, `AdminPage` — routed via React Router
- **API client:** `src/api/client.ts` — centralized typed fetch wrapper
- **Auth state:** JWT stored in localStorage, passed as Bearer token
- **Dev proxy:** Vite proxies `/api` to backend, so no CORS issues locally

### Request Flow

```
React SPA → Nginx (/api/* proxied) → ASP.NET Core Controller
  → Application Handler → Domain Entity → Infrastructure (EF Core / SQLite)
```

### Testing Strategy

| Layer | Framework | Approach |
|-------|-----------|----------|
| Unit | xUnit | Domain entities in isolation |
| Integration | xUnit + WebApplicationFactory | Full API endpoints with in-process SQLite |
| E2E | Playwright | Full user journeys through browser |

### CI/CD (GitHub Actions)

Pipeline jobs run in order: unit tests → integration tests → E2E (Docker-based) → deploy (main branch only via SSH + Docker Compose).
