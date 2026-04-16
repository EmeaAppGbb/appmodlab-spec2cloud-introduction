# ADR-002: Migrate from SQLite to PostgreSQL

## Status

Proposed

## Date

2026-04-16

---

## Modernization Annotations

| Property | Value |
|---|---|
| **Target Framework** | Fastify |
| **Target Database** | PostgreSQL |
| **Migration Complexity** | 🟠 Medium-High |
| **Migration Order** | 1–2 of 7 — schema migration first (step 1), then data access layer rewrite (step 2) |

### Component-Level Complexity Breakdown

| Component | Complexity | Rationale |
|---|---|---|
| Schema DDL (`schema.sql`) | 🟢 Low | Straightforward syntax changes: `AUTOINCREMENT` → `GENERATED ALWAYS AS IDENTITY`, `DATETIME` → `TIMESTAMPTZ` |
| Seed data (`seed.sql`) | 🟢 Low | Minor date function adjustments; string quoting is already compatible |
| Model layer (sync → async) | 🟠 Medium-High | All `better-sqlite3` synchronous calls (`.prepare()`, `.get()`, `.all()`, `.run()`) must become async `pg` pool queries. Every model method signature changes. |
| Connection management | 🟡 Medium | Add `pg.Pool` with connection pooling; integrate with Fastify lifecycle (`onClose` hook for pool shutdown) |
| Transaction handling | 🟡 Medium | Multi-table operations (`Loan.create`, `Loan.returnBook`) need explicit `BEGIN/COMMIT/ROLLBACK` via `pool.connect()` + client transactions |
| Migration tooling | 🟢 Low (net new) | Adopt `node-pg-migrate` or Prisma for version-controlled schema migrations |

---

## Context

The OpenShelf Library application currently uses **SQLite** (via the `better-sqlite3` package) as its database. SQLite is an embedded, file-based database that runs in-process with the Node.js application.

Key observations about the current SQLite setup:

- The database is a single file (`database/library.db`) stored on the local filesystem
- Schema is initialized on first run from `database/schema.sql` with seed data from `database/seed.sql`
- All queries use synchronous `better-sqlite3` APIs (`.prepare()`, `.get()`, `.all()`, `.run()`)
- The database stores books, members, and loans with foreign key relationships
- There is no connection pooling, migration tooling, or backup strategy
- SQLite uses a single-writer model — concurrent write access is limited

The modernized application targets cloud deployment on **Azure App Service**, which uses ephemeral filesystem storage. A file-based database would lose data on instance restarts, scaling events, or deployments.

## Decision

We recommend migrating from **SQLite** to **PostgreSQL** as the database engine for the modernized OpenShelf Library, hosted as an **Azure Database for PostgreSQL Flexible Server** managed service.

## Pros

- **Cloud-native persistence:** PostgreSQL runs as a managed service (Azure Database for PostgreSQL), decoupling data storage from the application instance. Data survives deployments, restarts, and scaling events.
- **Concurrent access:** PostgreSQL supports full MVCC (Multi-Version Concurrency Control), allowing multiple concurrent readers and writers — essential when running multiple app instances behind a load balancer.
- **Scalability:** PostgreSQL handles large datasets and high connection counts. Connection pooling (via PgBouncer, built into Azure Flexible Server) ensures efficient resource usage.
- **Advanced data types:** PostgreSQL supports JSONB, arrays, full-text search, and other advanced types that can simplify future feature development (e.g., book metadata, search).
- **Migration tooling:** Mature migration tools (e.g., `node-pg-migrate`, Prisma, Knex) provide version-controlled schema changes, replacing the current manual `schema.sql` approach.
- **Managed backups and HA:** Azure Database for PostgreSQL provides automated backups, point-in-time restore, and optional high-availability with zone-redundant replicas.
- **Ecosystem maturity:** PostgreSQL is one of the most widely used open-source relational databases, with excellent Node.js driver support (`pg`, Prisma, Drizzle).
- **Security:** Managed PostgreSQL supports Azure AD authentication, SSL/TLS enforcement, and network isolation via VNet integration and private endpoints.

## Cons

- **Operational complexity:** SQLite requires zero configuration — it is an embedded library. PostgreSQL requires provisioning, networking, connection string management, and ongoing monitoring.
- **Cost:** SQLite is free with no infrastructure cost. Azure Database for PostgreSQL incurs monthly charges for compute, storage, and backups (starting ~$15/month for a Burstable B1ms tier).
- **Latency:** SQLite queries execute in-process with no network round-trip. PostgreSQL introduces network latency between the application and the database server, though this is mitigated when deployed in the same Azure region.
- **Migration effort:** All synchronous `better-sqlite3` calls must be rewritten to use asynchronous PostgreSQL drivers. SQL syntax differences (e.g., `AUTOINCREMENT` → `SERIAL`/`GENERATED ALWAYS AS IDENTITY`, string quoting) require schema and query adjustments.
- **Local development:** Developers need a local PostgreSQL instance (or Docker container) for development, compared to SQLite's zero-install experience. This can be mitigated with Docker Compose or a dev container configuration.
- **Connection management:** The application must handle connection pooling, timeouts, and reconnection logic — concerns that do not exist with an embedded database.

## Consequences

- **Positive:** The application can safely run on Azure App Service with persistent, reliable data storage independent of the compute layer.
- **Positive:** Horizontal scaling (multiple app instances) becomes possible without database contention.
- **Positive:** Managed backups and point-in-time restore provide disaster recovery capabilities.
- **Positive:** Schema migrations become version-controlled and repeatable, improving deployment reliability.
- **Negative:** Infrastructure provisioning and Terraform/Bicep configuration must be added to the deployment pipeline.
- **Negative:** All database access code must be rewritten from synchronous to asynchronous patterns, touching every model and route handler.
- **Negative:** The local development setup becomes more complex, requiring a PostgreSQL instance or container.

## References

- [Azure Database for PostgreSQL Flexible Server](https://learn.microsoft.com/azure/postgresql/flexible-server/overview)
- [node-postgres (pg)](https://node-postgres.com/)
- [ADR-001: Spec-Driven Modernization](./adr-001-spec-driven-modernization.md)
