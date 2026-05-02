# Prompts and Planning Notes

This document contains the planning, spec breakdown, and approach used to build this system.

## Assignment Breakdown

The assignment required building a Mission-Critical Incident Management System with:
- High-throughput signal ingestion (10,000 signals/sec)
- Debouncing logic (100 signals → 1 Work Item per 10 seconds)
- Three separate storage layers (MongoDB, PostgreSQL, Redis)
- Strategy + State design patterns
- React frontend with live dashboard
- Mandatory RCA before closing incidents

## Tech Stack Decision

**Why Node.js + TypeScript?**
Native async/await, event loop handles concurrency well, TypeScript adds type safety for complex data models.

**Why BullMQ + Redis for the queue?**
BullMQ is purpose-built for Node.js job queues. Redis handles millions of items in memory, making it perfect for absorbing signal bursts before they hit the database.

**Why PostgreSQL for Work Items?**
Work item transitions must be transactional — if a status update fails halfway, we cannot have corrupted state. PostgreSQL ACID transactions guarantee this.

**Why MongoDB for raw signals?**
High write volume, flexible schema (metadata varies per signal type), and easy to query by component_id or work_item_id without joins.

**Why Redis for cache?**
Dashboard refreshes every 5 seconds. Without cache, every refresh hits PostgreSQL. Redis TTL-based caching serves dashboard state in microseconds.

## Architecture Decisions

### Backpressure Handling
Rate limiter → Redis Queue → Controlled worker concurrency → Database
This ensures the system never crashes under load.

### Debouncing Implementation
Redis INCR + EXPIRE per component_id creates a sliding 10-second window counter.
First signal in window creates a Work Item. Subsequent signals link to existing Work Item.

### State Machine
Explicit transition map enforced server-side:
OPEN → INVESTIGATING → RESOLVED → CLOSED
Invalid transitions return 400 with clear error message.

### RCA Validation
Server-side validation checks all fields, minimum length, and end > start time.
CLOSED transition is completely blocked without valid RCA.
