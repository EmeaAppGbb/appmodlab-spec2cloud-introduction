# ADR-001: Adopt Spec-Driven Modernization (Spec2Cloud)

## Status

Accepted

## Date

2026-04-16

## Context

The OpenShelf Library is a legacy monolithic Node.js/Express application with:
- Server-rendered HTML (EJS templates) — no API layer
- Synchronous SQLite storage via better-sqlite3
- No authentication or authorization
- No formal API documentation or architecture records
- Tightly coupled routes, models, and views in a single process

We need a structured approach to modernize this application for cloud deployment while preserving its business logic and data model.

## Decision

We will follow the **Spec2Cloud** methodology:

1. **Extract specifications** from the existing codebase — architecture overview, API endpoint inventory, and entity/data model.
2. **Record decisions** as Architecture Decision Records (ADRs) in `specs/decisions/`.
3. **Use specifications as the source of truth** to drive the modern implementation, rather than porting code line-by-line.

Specifications are stored in `specs/` with the following structure:
- `specs/architecture/` — system-level architecture documents
- `specs/api/` — endpoint and API contract definitions
- `specs/data/` — entity models and database schemas
- `specs/decisions/` — ADRs capturing key modernization choices

## Consequences

- **Positive:** Specifications become living documentation that outlives any single implementation.
- **Positive:** Modern rebuild can target any language/framework while staying true to the spec.
- **Positive:** ADRs provide an auditable trail of why decisions were made.
- **Negative:** Up-front effort is required to extract and maintain specs before writing new code.
