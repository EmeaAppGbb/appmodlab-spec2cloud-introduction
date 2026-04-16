---
title: "Intro to Spec2Cloud"
description: "Learn spec-driven development with OpenShelf Library - generate specs from code and build modern apps"
authors: ["marconsilva"]
category: "Spec-Driven Development"
industry: "Education"
services: []
languages: ["JavaScript"]
frameworks: ["Node.js", "Express.js"]
modernizationTools: ["Spec2Cloud"]
agenticTools: []
tags: ["spec-driven", "specification", "architecture", "api-contracts", "methodology"]
extensions: ["github.copilot"]
thumbnail: ""
video: ""
version: "1.0.0"
---

## Overview

This lab introduces spec-driven development using the OpenShelf Library application. You'll learn how to generate specifications from existing code and use them to build modern applications with Spec2Cloud.

### Learning Objectives

- Understand the spec-driven development philosophy and its advantages
- Install and configure the Spec2Cloud toolchain
- Run Spec2Cloud analysis on a legacy codebase
- Generate architecture specifications, API contracts, and data model docs
- Use specifications to drive a modernization implementation

### Prerequisites

- Node.js 18+ installed
- Basic Node.js development experience
- Understanding of REST API design
- Git command-line proficiency

### Estimated Duration

2–3 hours

---

## Understanding the Legacy Application

The OpenShelf Library is a Node.js Express application with SQLite storage, Bootstrap UI, and EJS templates. Below is what the legacy application looks like when running (`npm start` on port 3000).

The homepage serves as the main entry point to the library system:

![Homepage](assets/screenshots/01-homepage.png)

### Book Management

The book catalog displays all books in the library with search and filter capabilities:

![Book Catalog](assets/screenshots/02-book-catalog.png)

New books can be added through a structured form with fields for title, author, ISBN, and category:

![Add Book Form](assets/screenshots/03-add-book-form.png)

### Member & Loan Management

The members list shows all registered library members and their borrowing status:

![Members List](assets/screenshots/04-members-list.png)

The loans overview tracks all active and historical book loans across the library:

![Loans Overview](assets/screenshots/05-loans-overview.png)

The checkout form handles the book lending process, linking a member to a book:

![Checkout Form](assets/screenshots/06-checkout-form.png)

---

## Step-by-Step Solution Guide

> **Branch:** `solution-final` contains all completed steps with tags `step-01` through `step-10`.

### Step 01: Explore the Legacy App

Install dependencies and start the application to verify all routes work.

```bash
npm install
npm start
```

**Expected Output:**
```
OpenShelf Library running at http://localhost:3000
```

Verify these routes return HTTP 200:

| Route | Description |
|-------|-------------|
| `http://localhost:3000/` | Homepage with statistics |
| `http://localhost:3000/books` | Book catalog |
| `http://localhost:3000/books/new` | Add book form |
| `http://localhost:3000/members` | Members list |
| `http://localhost:3000/members/new` | Add member form |
| `http://localhost:3000/loans` | Loans overview |
| `http://localhost:3000/loans/checkout` | Checkout form |

<details>
<summary>📄 CLI Output (step-01)</summary>

```
=== Step 01: Explore the Legacy App ===
[OK] Homepage (http://localhost:3000/) - Status: 200
[OK] Books Catalog (http://localhost:3000/books) - Status: 200
[OK] Add Book Form (http://localhost:3000/books/new) - Status: 200
[OK] Members List (http://localhost:3000/members) - Status: 200
[OK] Add Member Form (http://localhost:3000/members/new) - Status: 200
[OK] Loans Overview (http://localhost:3000/loans) - Status: 200
[OK] Checkout Form (http://localhost:3000/loans/checkout) - Status: 200

All routes verified successfully.
```

</details>

---

### Step 02: Install Spec2Cloud

Create the Spec2Cloud configuration file and verify the specs directory structure.

Create `spec2cloud.config.json`:
```json
{
  "project": { "name": "openshelf-library" },
  "source": {
    "root": "./src",
    "entryPoint": "app.js",
    "framework": "express",
    "database": { "type": "sqlite", "schemaPath": "./database/schema.sql" }
  },
  "target": {
    "framework": "fastify",
    "database": { "type": "postgresql" }
  },
  "specs": { "outputDir": "./specs" }
}
```

**Expected directory structure:**
```
specs/
├── architecture/
├── api/
├── data/
└── decisions/
```

<details>
<summary>📄 CLI Output (step-02)</summary>

See `assets/outputs/step-02-install-spec2cloud.txt`

</details>

---

### Step 03: Run Analysis

Run Spec2Cloud analysis against the codebase to generate `specs/analysis-report.md`.

**Expected findings:**
- Pattern: Monolithic MVC
- Routes: 17 endpoints across 3 modules
- Models: 3 entities (books, members, loans)
- Relationships: 2 foreign keys
- Indexes: 3 (loans.status, loans.due_date, books.genre)

<details>
<summary>📄 CLI Output (step-03)</summary>

```
--- Files Analyzed ---
  src/app.js                    (109 lines) - Application entry, DB init
  src/routes/books.js           (87 lines)  - Book CRUD routes
  src/routes/members.js         (95 lines)  - Member CRUD routes
  src/routes/loans.js           (64 lines)  - Loan checkout/return routes
  src/models/book.js            (81 lines)  - Book data access layer
  src/models/member.js          (69 lines)  - Member data access layer
  src/models/loan.js            (122 lines) - Loan data access layer
  database/schema.sql           (41 lines)  - SQLite DDL
  database/seed.sql             (58 lines)  - Sample data

Analysis complete. Ready for spec generation.
```

</details>

---

### Step 04: Generate Architecture Spec

Generate `specs/architecture/system-overview.md` with component architecture, dependencies, data flow, and deployment model.

**Key sections generated:**
1. System Context diagram
2. Component Architecture (app layer, routes, models, views)
3. Dependencies inventory
4. Read/write data flow diagrams
5. Deployment model and limitations
6. Security assessment

<details>
<summary>📄 CLI Output (step-04)</summary>

See `assets/outputs/step-04-generate-architecture-spec.txt`

</details>

---

### Step 05: Generate API Contracts

Generate `specs/api/openapi.yaml` (OpenAPI 3.0.3) by analyzing Express routes.

**Endpoints mapped (15 total):**

| Module | Routes |
|--------|--------|
| Books | GET /books, POST /books, GET/PUT/DELETE /books/{id} |
| Members | GET /members, POST /members, GET/PUT/DELETE /members/{id}, POST /members/{id}/deactivate |
| Loans | GET /loans, POST /loans/checkout, POST /loans/{id}/return |

**Schemas defined:** Book, BookInput, Member, MemberInput, Loan, CheckoutInput, LoanStatistics, Error

<details>
<summary>📄 CLI Output (step-05)</summary>

```
--- Modernization Notes ---
  POST-based updates converted to RESTful PUT/DELETE
  Response format changed from HTML to JSON
  Added JSON Schema validation constraints
  Added proper HTTP status codes (201, 204, 400, 404)
```

</details>

---

### Step 06: Generate Data Models

Generate `specs/data/entity-relationships.md` documenting the SQLite schema and relationships.

**Entity summary:**

| Table | Columns | Keys | Business Rules |
|-------|---------|------|----------------|
| books | 9 | PK, UNIQUE(isbn) | available_copies tracking, loan-protected delete |
| members | 7 | PK, UNIQUE(email) | Status check constraint, loan-protected deactivate |
| loans | 8 | PK, 2 FKs | Availability validation, auto-overdue, 14-day default |

<details>
<summary>📄 CLI Output (step-06)</summary>

See `assets/outputs/step-06-generate-data-models.txt`

</details>

---

### Step 07: Create ADRs

Generate Architecture Decision Records in `specs/decisions/`.

**ADR-001: Framework Migration**
- Decision: Express.js → Fastify
- Rationale: 4x performance, built-in schema validation, plugin system, OpenAPI integration

**ADR-002: Database Migration**
- Decision: SQLite → PostgreSQL
- Rationale: Concurrent writes, ENUM types, full-text search, cloud-ready

<details>
<summary>📄 CLI Output (step-07)</summary>

See `assets/outputs/step-07-create-adrs.txt`

</details>

---

### Step 08: Refine Specs

Add modernization annotations to all specification documents targeting Fastify + PostgreSQL.

**Files updated:**
- `specs/architecture/system-overview.md` — Added Section 7: Modernization Target with target architecture diagram
- `specs/api/openapi.yaml` — Version bumped to 2.0.0 with target metadata
- `specs/data/entity-relationships.md` — Added schema evolution plan and query migration checklist

<details>
<summary>📄 CLI Output (step-08)</summary>

```
--- Modernization Decisions Applied ---
  Framework:  Express.js 4.18 → Fastify 5.x (ADR-001)
  Database:   SQLite → PostgreSQL 16 (ADR-002)
  API Style:  HTML forms → RESTful JSON
  Validation: Manual → JSON Schema (Fastify native)
  Logging:    console.log → Pino
  Docs:       None → @fastify/swagger
```

</details>

---

### Step 09: Build from Specs

Create the modern application in `modern/` — a Fastify-based project built from the specifications.

**Project structure:**
```
modern/
├── package.json               # Fastify 5.x + pg
├── README.md
├── database/
│   ├── schema.sql             # PostgreSQL (ENUM types, GIN index)
│   └── seed.sql               # PostgreSQL seed data
└── src/
    ├── app.js                 # Fastify app with plugin registration
    ├── schemas/               # JSON Schema from OpenAPI components
    │   ├── book.js
    │   ├── member.js
    │   └── loan.js
    └── routes/                # RESTful route plugins
        ├── books.js           # GET/POST/PUT/DELETE
        ├── members.js         # GET/POST/PUT/DELETE + deactivate
        └── loans.js           # checkout/return with stats
```

**Key improvements over legacy:**
- RESTful JSON API (GET/POST/PUT/DELETE) instead of HTML forms
- JSON Schema validation on all routes
- Swagger UI at `/docs`
- PostgreSQL with async driver
- Health check at `/health`
- Structured logging with Pino

<details>
<summary>📄 CLI Output (step-09)</summary>

```
--- npm install ---
added 92 packages, audited 93 packages
found 0 vulnerabilities

--- Endpoints (15 total) ---
  GET    /              Statistics dashboard
  GET    /health        Health check
  GET    /books         List books (?search=)
  POST   /books         Create book
  PUT    /books/:id     Update book
  DELETE /books/:id     Delete book
  GET    /members       List members
  POST   /members       Create member
  PUT    /members/:id   Update member
  DELETE /members/:id   Delete member
  GET    /loans         List loans (?filter=)
  POST   /loans/checkout  Checkout book
  POST   /loans/:id/return  Return book
```

</details>

---

### Step 10: Validate Against Specs

Run the validation checklist comparing the modern implementation against all specifications.

**Validation results:**

| Category | Checks | Passed |
|----------|--------|--------|
| Architecture | 10 | 10 ✅ |
| API Contract (endpoints) | 15 | 15 ✅ |
| API Contract (schemas) | 7 | 7 ✅ |
| Data Model | 15 | 15 ✅ |
| ADR Compliance | 7 | 7 ✅ |
| Business Logic | 9 | 9 ✅ |
| **Total** | **63** | **63 ✅** |

Full checklist: `specs/validation-checklist.md`

<details>
<summary>📄 CLI Output (step-10)</summary>

See `assets/outputs/step-10-validate-against-specs.txt`

</details>

---

## Screenshots Reference

| Screenshot | Description |
|---|---|
| ![Homepage](assets/screenshots/01-homepage.png) | Library homepage |
| ![Book Catalog](assets/screenshots/02-book-catalog.png) | Book catalog listing |
| ![Add Book Form](assets/screenshots/03-add-book-form.png) | New book entry form |
| ![Members List](assets/screenshots/04-members-list.png) | Library members list |
| ![Loans Overview](assets/screenshots/05-loans-overview.png) | Book loans tracking |
| ![Checkout Form](assets/screenshots/06-checkout-form.png) | Book checkout form |
