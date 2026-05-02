# Incident Management System (IMS)

A mission-critical, production-grade Incident Management System built to monitor distributed infrastructure (APIs, MCP Hosts, Caches, Queues, RDBMS, NoSQL) and manage failure mediation workflows end-to-end.

---

## Architecture Diagram

```
                      ┌─────────────────────────────────────────────────┐
                      │              CLIENT / INFRASTRUCTURE             │
                      │         (APIs, Caches, Queues, RDBMS)           │
                      └────────────────────┬────────────────────────────┘
                                           │ POST /api/signals
                                           ▼
                      ┌─────────────────────────────────────────────────┐
                      │              RATE LIMITER (1000 req/min)         │
                      └────────────────────┬────────────────────────────┘
                                           │
                                           ▼
                      ┌─────────────────────────────────────────────────┐
                      │           REDIS QUEUE (BullMQ)                  │
                      │     Buffers up to 10,000 signals/sec            │
                      │     Retry: 3 attempts, exponential backoff      │
                      └────────────────────┬────────────────────────────┘
                                           │
                                           ▼
                      ┌─────────────────────────────────────────────────┐
                      │              WORKER (Concurrency: 10)           │
                      │         Debounce: 1 Work Item per               │
                      │         Component ID per 10 seconds             │
                      └──────┬─────────────────────────┬────────────────┘
                             │                         │
                ┌────────────▼──────────┐   ┌──────────▼──────────────┐
                │   MongoDB             │   │   PostgreSQL             │
                │   Raw Signals         │   │   Work Items + RCA       │
                │   (Audit Log /        │   │   (Source of Truth)      │
                │    Data Lake)         │   │   Transactional          │
                └───────────────────────┘   └──────────┬──────────────┘
                                                       │
                                           ┌───────────▼──────────────┐
                                           │   Redis Cache             │
                                           │   Dashboard Hot-Path      │
                                           │   TTL: 10 seconds         │
                                           └───────────┬──────────────┘
                                                       │
                                           ┌───────────▼──────────────┐
                                           │   React Frontend          │
                                           │   - Live Dashboard        │
                                           │   - Incident Detail       │
                                           │   - RCA Form              │
                                           └───────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend | Node.js + TypeScript | Async processing, type safety |
| Queue | Redis + BullMQ | High-throughput signal buffering |
| Source of Truth | PostgreSQL | Work Items, RCA, transactional updates |
| Data Lake | MongoDB | Raw signal storage, audit log |
| Cache | Redis | Dashboard hot-path, avoids DB queries |
| Frontend | React + TypeScript | Live dashboard, RCA form |
| Infrastructure | Docker Compose | One-command full stack setup |

---

## Features

- **High-throughput ingestion** — Redis queue buffers up to 10,000 signals/sec without crashing
- **Debouncing** — 100 signals for the same component within 10 seconds creates only 1 Work Item
- **Strategy Pattern** — P0 for RDBMS, P1 for API/Queue, P2 for Cache failures
- **State Pattern** — Enforces OPEN → INVESTIGATING → RESOLVED → CLOSED transitions
- **Mandatory RCA** — System rejects CLOSED transition without complete RCA
- **MTTR Calculation** — Automatically calculated from incident start to RCA submission
- **Rate Limiting** — 1000 requests/minute on ingestion API
- **Redis Cache** — Dashboard reads from cache, not database on every refresh
- **Health Endpoint** — /health checks all three services
- **Throughput Metrics** — Prints signals/sec to console every 5 seconds
- **Timeseries Aggregations** — Incidents by hour, priority, status, MTTR stats

---

## How Backpressure is Handled

This is a critical design decision in the system.

**The Problem:** If 10,000 signals arrive per second and the database can only write 500/sec, a naive implementation would crash — either running out of memory or overwhelming the database.

**Our Solution — Redis Queue as a Buffer:**

```
Signals arrive → Rate Limiter → Redis Queue → Worker (controlled pace) → Database
```

1. **Rate Limiter** — First line of defense. Caps incoming requests at 1000/min per client
2. **Redis Queue (BullMQ)** — Acts as an in-memory buffer. Signals are accepted instantly into the queue regardless of how fast the database is. Redis can handle millions of items in memory
3. **Worker Concurrency** — Worker processes 10 jobs simultaneously — fast enough to keep up, controlled enough to not overwhelm the database
4. **Retry with Backoff** — If a database write fails, BullMQ retries 3 times with exponential backoff (1s, 2s, 4s) instead of dropping the signal
5. **Debouncing** — Reduces database writes by collapsing 100 signals into 1 Work Item

This means the system **never crashes under load** — it simply queues the work and processes it at a sustainable pace.

---

## Setup Instructions

There are two ways to run this project depending on your preference.

### Prerequisites
- Docker and Docker Compose
- Node.js v20+
- npm

---

### Option 1 — Full Docker Setup (Recommended for reviewers)

This runs everything — databases, backend, and frontend — as Docker containers with a single command. The `--build` flag builds the backend and frontend Docker images before starting.

```bash
# Clone the repository
git clone https://github.com/amanpandey3956/Incident-Management-System.git
cd ims-assignment

# Build and start all services including backend and frontend containers
docker compose up --build

# Access the application
# Frontend:     http://localhost:3000
# Backend API:  http://localhost:3001
# Health check: http://localhost:3001/health
```

---

### Option 2 — Manual Setup (Recommended for development)

In this mode, only the databases run in Docker. The backend and frontend run directly on your machine which gives you hot reload and faster iteration.

**Step 1 — Start only the databases in Docker:**
```bash
cd ims-assignment
docker compose up postgres mongodb redis -d
```

**Step 2 — Start the backend:**
```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ Redis connected
✅ MongoDB connected
✅ PostgreSQL tables initialized
Signal worker started
IMS Backend running on port 3001
Throughput: 0.00 signals/sec | Total: 0
```

**Step 3 — Start the frontend (open a new terminal):**
```bash
cd frontend
npm install
npm start
```

Frontend opens automatically at `http://localhost:3000`.

---

### Run Tests
```bash
cd backend
npm test
```

---

## Simulating Failure Events

There are two ways to generate incidents in the system:

### Option 1 — Simulate Signal Button (UI)

The dashboard has a **"+ Simulate Signal"** button in the top right corner. Clicking it sends one random signal to a random component (RDBMS, Cache, API, or Queue) and the resulting incident appears in the live feed immediately. This is useful for a quick demo without any terminal commands.

### Option 2 — Simulation Script (Multi-component cascading failure)

For a realistic production scenario — an RDBMS outage followed by an MCP host failure, cache spike, and queue backup all at once — run the included script.

> **Note:** Run this from inside the `ims-assignment` root folder.

```bash
cd ims-assignment
./scripts/simulate-failure.sh
```

This sends 14 signals across 4 different components and prints a summary of all created work items at the end.

You can also send a manual signal directly via curl:
```bash
curl -X POST http://localhost:3001/api/signals \
  -H "Content-Type: application/json" \
  -d '{
    "component_id": "RDBMS_POSTGRES_01",
    "signal_type": "CONNECTION_REFUSED",
    "severity": "CRITICAL",
    "message": "Database connection pool exhausted"
  }'
```

The exact signal payload structure used in the simulation script is documented in `scripts/sample-signals.json` for reference.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Health check for all services |
| POST | /api/signals | Ingest a new signal |
| GET | /api/signals/:workItemId | Get raw signals for a work item |
| GET | /api/workitems | List all work items sorted by priority |
| GET | /api/workitems/:id | Get a single work item |
| PATCH | /api/workitems/:id/status | Transition work item status |
| GET | /api/aggregations | Timeseries aggregations |

---

## Design Patterns Used

**Strategy Pattern** (`alert.service.ts`)
Different components trigger different alert priorities. The strategy is selected at runtime based on component ID — swapping alert logic without changing the core workflow engine.

**State Pattern** (`workitem.service.ts`)
Work item transitions are governed by a strict state machine. Invalid transitions (e.g. OPEN → CLOSED) are rejected with a clear error message. The CLOSED state additionally requires a complete RCA object.

---

## Evaluation Rubric Coverage

| Category | Implementation |
|---|---|
| Concurrency & Scaling | BullMQ with concurrency 10, Redis buffer, rate limiter |
| Data Handling | MongoDB (signals), PostgreSQL (work items), Redis (cache) |
| LLD | Strategy Pattern, State Pattern, TypeScript interfaces |
| UI/UX & Integration | React dashboard, detail view, RCA form, auto-refresh |
| Resilience & Testing | 3x retry with backoff, 8 unit tests for RCA validation |
| Documentation | This README, architecture diagram, API reference |
| Tech Stack | Justified choices for each layer in the table above |

---

## Additional Documentation

- `scripts/sample-signals.json` — Sample signal payloads showing the exact request format for all component types
- `docs/PROMPTS.md` — Full breakdown of the assignment, tech stack decisions, and architecture reasoning used while building this system

---

## Project Structure

```
ims-assignment/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Redis connections
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # TypeScript interfaces + Mongoose schemas
│   │   ├── queues/          # BullMQ queue and worker
│   │   ├── middleware/      # Rate limiter, error handler
│   │   ├── utils/           # Metrics, debounce
│   │   └── __tests__/       # Unit tests
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, IncidentDetail, RCAForm
│   │   ├── components/      # Navbar, StatusBadge
│   │   └── services/        # API client
│   ├── Dockerfile
│   └── nginx.conf           # Nginx config for React Router + API proxy
├── scripts/
│   ├── simulate-failure.sh  # Multi-component cascading failure simulation
│   └── sample-signals.json  # Sample signal payload reference
├── docs/
│   └── PROMPTS.md           # Planning notes and architecture decisions
├── docker-compose.yml
└── README.md
```