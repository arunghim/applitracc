# ┌─────────────────────────────────────────────────────────────────────────────┐
# │  applitracc — Makefile command reference                                    │
# │                                                                             │
# │  RUN                                                                        │
# │    make up                Start all services (db + backend + frontend)      │
# │    make backend           Start db + backend only                           │
# │    make frontend          Start frontend only (backend must already be up)  │
# │                                                                             │
# │  STOP                                                                       │
# │    make down              Stop all services                                 │
# │    make stop-backend      Stop backend container only                       │
# │    make stop-frontend     Stop frontend container only                      │
# │    make clean             Stop all + wipe volumes (deletes DB data)         │
# │                                                                             │
# │  INSTALL                                                                    │
# │    make install           Install all dependencies (frontend + backend)     │
# │                                                                             │
# │  REBUILD  (no-cache — use after code changes)                               │
# │    make rebuild           Install deps, rebuild all images, restart all     │
# │    make rebuild-backend   Install deps, rebuild backend image, restart it   │
# │    make rebuild-frontend  Install deps, rebuild frontend image, restart it  │
# │                                                                             │
# │  DEV  (hot reload)                                                          │
# │    make dev               Start db + backend in Docker, frontend with HMR   │
# │                                                                             │
# │  OBSERVE                                                                    │
# │    make logs              Stream logs from all containers (Ctrl+C to stop)  │
# │    make ps                Show status of all containers                     │
# └─────────────────────────────────────────────────────────────────────────────┘

.PHONY: up down backend frontend stop-backend stop-frontend logs ps clean install rebuild rebuild-backend rebuild-frontend dev

up:
	docker compose up -d

backend:
	docker compose up -d db backend

frontend:
	docker compose up -d frontend

down:
	docker compose down

stop-backend:
	docker compose stop backend

stop-frontend:
	docker compose stop frontend

clean:
	docker compose down -v --remove-orphans

dev:
	docker compose up -d db backend
	npm --prefix ./frontend run dev

install:
	npm --prefix ./frontend install
	./backend/mvnw -f ./backend/pom.xml dependency:go-offline -q

rebuild: install
	docker compose down
	docker compose build --no-cache
	docker compose up -d

rebuild-backend: install
	docker compose build --no-cache backend
	docker compose up -d backend

rebuild-frontend: install
	docker compose build --no-cache frontend
	docker compose up -d frontend

logs:
	docker compose logs -f

ps:
	docker compose ps
