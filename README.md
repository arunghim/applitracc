# Applitracc

Applitracc is a full-stack job application tracking tool that lets users log, organize, and monitor every job they apply to. It supports custom user-defined columns, filterable and paginated application lists, and a token-based authentication system designed with security in mind.

The project consists of a Spring Boot REST API and a React single-page application, with the backend deployed on Railway and the frontend deployed on Vercel. For local development, the services are orchestrated with Docker Compose and a developer-friendly Makefile, providing a consistent setup across environments.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running with Docker Compose](#running-with-docker-compose)
  - [Running in Development Mode (Hot Reload)](#running-in-development-mode-hot-reload)
- [Makefile Reference](#makefile-reference)
- [Services](#services)
- [Authentication Model](#authentication-model)
- [Deployment](#deployment)
- [Testing](#testing)

---

## Overview

Users create an account, log in, and land on a dashboard where they can:

- Add job applications with fields such as company, role, salary, status, application date, a link to the posting, and freeform notes.
- Track each application through a lifecycle of statuses: Saved, Applied, Interview, Offer, Accepted, or Rejected.
- Create custom columns that extend the default schema with any user-defined field name, with per-application values persisted to the database.
- Filter the application list by status or company name and navigate through paginated results.
- Log out securely, which revokes the server-side refresh token and clears the session cookie.

---

## Architecture

```
Browser
  |
  |-- React SPA (Vite / React Router)
        |
        |-- /api/* proxied to Spring Boot (nginx in production, Vite dev server proxy in development)
              |
              |-- Spring Boot REST API
                    |
                    |-- PostgreSQL (managed schema via Flyway migrations)
```

In production the frontend container serves the compiled React bundle through nginx. The nginx configuration reverse-proxies all requests to `/api/` through to the backend container at port 8080. In development the Vite dev server provides the same proxy behavior with hot module replacement enabled.

---

## Tech Stack

| Layer       | Technology                                             |
| ----------- | ------------------------------------------------------ |
| Backend     | Java 17, Spring Boot 4.0.5                             |
| Persistence | Spring Data JPA, Hibernate, PostgreSQL 17              |
| Migrations  | Flyway                                                 |
| Security    | Spring Security, JWT (JJWT 0.12.6), BCrypt             |
| Frontend    | React 19, Vite 8, React Router 7                       |
| Testing     | JUnit 5 (backend), Vitest + Testing Library (frontend) |
| Container   | Docker, Docker Compose, nginx (alpine)                 |
| Deployment  | Railway (backend), Vercel (frontend)                   |

---

## Repository Structure

```
applitracc/
├── backend/                  Spring Boot application
│   ├── src/
│   │   ├── main/java/        Application source code
│   │   └── resources/        application.properties, Flyway SQL migrations
│   ├── Dockerfile
│   ├── pom.xml
│   └── railway.toml          Railway deployment config
├── frontend/                 React + Vite application
│   ├── src/
│   │   ├── api/              Fetch-based API client with silent token refresh
│   │   ├── components/       Shared UI components
│   │   └── pages/            Route-level page components
│   ├── Dockerfile
│   ├── nginx.conf            Production nginx config (SPA routing + API proxy)
│   ├── vite.config.js
│   └── vercel.json
├── docker-compose.yml        Orchestrates db, backend, and frontend containers
└── Makefile                  Developer convenience commands
```

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (only needed for the `make dev` hot-reload workflow)
- Java 17 and Maven (only needed if running the backend outside Docker)

### Environment Variables

Copy or create a `.env` file in the project root before starting any services. The only required variable is `JWT_SECRET`.

| Variable            | Default                 | Description                                  |
| ------------------- | ----------------------- | -------------------------------------------- |
| `JWT_SECRET`        | (required)              | Base64-encoded HMAC-SHA key for signing JWTs |
| `POSTGRES_DB`       | `applitracc`            | Database name                                |
| `POSTGRES_USER`     | `postgres`              | Database user                                |
| `POSTGRES_PASSWORD` | `postgres`              | Database password                            |
| `JWT_EXPIRATION`    | `86400000` (24 h in ms) | Access token lifetime (milliseconds)         |

Example `.env`:

```
JWT_SECRET=your-base64-encoded-secret-here
POSTGRES_PASSWORD=a-secure-password
```

### Running with Docker Compose

```bash
# First time only — install dependencies
make install

# Start all three services (database, backend, frontend)
make up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

Flyway will run pending migrations automatically when the backend starts. No manual database setup is required.

### Running in Development Mode (Hot Reload)

```bash
make dev
```

This starts the PostgreSQL database and the Spring Boot backend inside Docker, then starts the Vite dev server on the host (port 5173) with hot module replacement. The Vite dev server proxies all `/api` requests to `http://localhost:8080`.

---

## Makefile Reference

| Command                 | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `make up`               | Start all services in detached mode                            |
| `make down`             | Stop all services                                              |
| `make backend`          | Start database + backend only                                  |
| `make frontend`         | Start frontend container only                                  |
| `make stop-backend`     | Stop backend container without removing it                     |
| `make stop-frontend`    | Stop frontend container without removing it                    |
| `make clean`            | Stop all services and wipe all volumes (deletes database data) |
| `make dev`              | Run database + backend in Docker, frontend with HMR on host    |
| `make install`          | Install npm dependencies and Maven dependencies                |
| `make rebuild`          | Full no-cache rebuild of all images                            |
| `make rebuild-backend`  | No-cache rebuild of backend image only                         |
| `make rebuild-frontend` | No-cache rebuild of frontend image only                        |
| `make logs`             | Stream logs from all containers                                |
| `make ps`               | Show container status                                          |

---

## Services

### Database

PostgreSQL 17 running in an Alpine-based Docker container. Data is persisted to a named Docker volume (`postgres_data`). The backend waits for the database health check to pass before starting.

### Backend

Spring Boot application on port 8080. Exposes a versioned REST API under `/api`. See [backend/README.md](backend/README.md) for full API documentation.

### Frontend

React SPA built by Vite and served by nginx on port 3000. In production nginx handles SPA routing (all non-file paths fall back to `index.html`) and proxies `/api/` requests to the backend container. See [frontend/README.md](frontend/README.md) for full details.

---

## Authentication Model

Authentication uses a two-token strategy:

- **Access token**: A short-lived JWT (default 15 minutes) issued on login and stored in JavaScript module memory — never in `localStorage` or `sessionStorage`. This protects it from XSS attacks.
- **Refresh token**: A long-lived opaque token (default 7 days) stored as an `HttpOnly`, `Path=/api/auth` cookie. It is never accessible to JavaScript.

When an access token expires, the API client automatically sends the refresh cookie to `/api/auth/refresh` to obtain a new access token without requiring the user to log in again. On logout the server revokes the refresh token in the database and clears the cookie.

---

## Deployment

**Backend**: Configured for Railway via `backend/railway.toml`. The Docker image is built from `backend/Dockerfile`. The health check endpoint at `/api/health` is used by Railway to determine readiness.

**Frontend**: Configured for Vercel via `frontend/vercel.json`. The compiled static bundle is deployed directly. Set `VITE_API_URL` in the Vercel environment to point to the deployed backend URL.

---

## Testing

```bash
# Backend unit tests
cd backend && ./mvnw test

# Frontend tests
cd frontend && npm test
```

See each service's README for details on the test suites.
