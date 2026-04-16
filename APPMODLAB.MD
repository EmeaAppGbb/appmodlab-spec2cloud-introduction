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

## Screenshots Reference

| Screenshot | Description |
|---|---|
| ![Homepage](assets/screenshots/01-homepage.png) | Library homepage |
| ![Book Catalog](assets/screenshots/02-book-catalog.png) | Book catalog listing |
| ![Add Book Form](assets/screenshots/03-add-book-form.png) | New book entry form |
| ![Members List](assets/screenshots/04-members-list.png) | Library members list |
| ![Loans Overview](assets/screenshots/05-loans-overview.png) | Book loans tracking |
| ![Checkout Form](assets/screenshots/06-checkout-form.png) | Book checkout form |

## Solution Walkthrough

This walkthrough uses the **GH Copilot CLI** (`gh copilot`) to perform Spec2Cloud analysis and generation. Each step below includes the exact command to run. The completed solution is on the `solution-final` branch with tags for each step.

### Prerequisites

```powershell
cd C:\code\gbb\labs\appmodlab-spec2cloud-introduction
git checkout main
git checkout -b solution-final
mkdir -p assets/outputs
```

---

### Step 1: Explore the Legacy App

Start the application and verify all routes respond.

```powershell
npm install && npm start
```

Test the routes in another terminal:

```powershell
# Homepage
curl http://localhost:3000          # 200 OK, 4092 bytes
# Books catalog
curl http://localhost:3000/books    # 200 OK, 26320 bytes
# Members list
curl http://localhost:3000/members  # 200 OK, 13172 bytes
# Loans overview
curl http://localhost:3000/loans    # 200 OK, 10861 bytes
# Add book form
curl http://localhost:3000/books/new       # 200 OK
# Checkout form
curl http://localhost:3000/loans/checkout  # 200 OK
```

**Key output:** All 6 routes return `200 OK`. The app is an Express + SQLite + EJS monolith with book/member/loan management.

**Files created:** `assets/outputs/step-01-explore-legacy-app.txt`

```powershell
git add assets/outputs/step-01-explore-legacy-app.txt
git commit -m "Step 01: Explore legacy app"
git tag step-01-explore-legacy-app
```

---

### Step 2: Set Up Spec2Cloud Configuration

**Prompt to GH Copilot CLI:**

```powershell
gh copilot -- -p "I want to use the Spec2Cloud methodology to analyze this legacy OpenShelf Library application. Create a spec2cloud configuration file and set up the specs/ directory structure with subdirectories for architecture/, api/, data/, and decisions/." --allow-all-tools --yolo 2>&1 | Tee-Object -FilePath "assets/outputs/step-02-setup-spec2cloud.txt"
```

**What Copilot does:** Reads the entire codebase (app.js, routes, models, schema.sql), then creates:

| File | Description |
|---|---|
| `spec2cloud.config.json` | Project config: legacy stack, spec output dirs, modernization goals |
| `specs/api/endpoints.md` | Full endpoint inventory (17 routes) with business rules |
| `specs/architecture/system-overview.md` | Component diagram, request flow, dependency inventory |
| `specs/data/entity-model.md` | ER diagram, table definitions, indexes, integrity rules |
| `specs/decisions/adr-001-spec-driven-modernization.md` | ADR adopting the Spec2Cloud methodology |

```powershell
git add spec2cloud.config.json specs/ assets/outputs/step-02-setup-spec2cloud.txt
git commit -m "Step 02: Set up Spec2Cloud configuration"
git tag step-02-setup-spec2cloud
```

---

### Step 3: Run Spec2Cloud Analysis

**Prompt to GH Copilot CLI:**

```powershell
gh copilot -- -p "Analyze this OpenShelf Library codebase using the Spec2Cloud methodology. Examine the source code in src/, the database schema, the routes, models, and views. Generate a comprehensive analysis report documenting the current architecture, components, dependencies, data flows, and technical debt. Save the analysis to specs/analysis-report.md" --allow-all-tools --yolo 2>&1 | Tee-Object -FilePath "assets/outputs/step-03-analysis.txt"
```

**What Copilot does:** Deep-reads every source file (routes, models, views, schema, seed data) and generates a 545-line analysis report covering:
- Architecture: Single-process monolith with MVC pattern
- Components: 3 models, 3 route files (18 endpoints), 7 EJS templates
- Data Model: 3 tables with FK relationships, CHECK constraints, 3 indexes
- Technical Debt: 20 items cataloged (no auth, no tests, no transactions, no CSRF)

**Files created:** `specs/analysis-report.md`

```powershell
git add specs/analysis-report.md assets/outputs/step-03-analysis.txt
git commit -m "Step 03: Run Spec2Cloud analysis"
git tag step-03-run-analysis
```

---

### Step 4: Generate Architecture Specification

**Prompt to GH Copilot CLI:**

```powershell
gh copilot -- -p "Based on the analysis of the OpenShelf Library, generate a comprehensive architecture specification document at specs/architecture/system-overview.md. Include: system components, component interactions, deployment model, technology stack details, and a component dependency diagram in Mermaid format." --allow-all-tools --yolo 2>&1 | Tee-Object -FilePath "assets/outputs/step-04-architecture-spec.txt"
```

**What Copilot does:** Updates `specs/architecture/system-overview.md` (expanded to ~580 lines) with:
- Executive summary and key metrics
- 5-layer component breakdown (entry point, routes, models, views, database)
- 3 Mermaid diagrams (system architecture, model dependencies, package graph)
- Request lifecycle sequence diagram
- Data architecture with ER diagram
- Assessment across 14 quality attributes

**Files modified:** `specs/architecture/system-overview.md`

```powershell
git add specs/architecture/system-overview.md assets/outputs/step-04-architecture-spec.txt
git commit -m "Step 04: Generate architecture specification"
git tag step-04-architecture-spec
```

---

### Step 5: Generate API Contracts (OpenAPI)

**Prompt to GH Copilot CLI:**

```powershell
gh copilot -- -p "Analyze the Express routes in this OpenShelf Library app and generate an OpenAPI 3.0 specification at specs/api/openapi.yaml. Include all endpoints for books, members, and loans with request/response schemas, status codes, and descriptions. Base it on the actual route handlers in src/routes/." --allow-all-tools --yolo 2>&1 | Tee-Object -FilePath "assets/outputs/step-05-api-contracts.txt"
```

**What Copilot does:** Creates a 767-line OpenAPI 3.0 spec with:
- 15 paths covering all routes (`/`, `/books/*`, `/members/*`, `/loans/*`)
- 8 schemas: Book, BookInput, Member, MemberInput, Loan, CheckoutInput, etc.
- 4 tags: Home, Books, Members, Loans
- Status codes: 200 (renders), 302 (redirects), 400 (errors), 404 (not found)
- Request bodies use `application/x-www-form-urlencoded` matching Express middleware

**Files created:** `specs/api/openapi.yaml`

```powershell
git add specs/api/openapi.yaml assets/outputs/step-05-api-contracts.txt
git commit -m "Step 05: Generate API contracts (OpenAPI)"
git tag step-05-api-contracts
```

---

### Step 6: Generate Data Model Specification

**Prompt to GH Copilot CLI:**

```powershell
gh copilot -- -p "Generate a data model specification document at specs/data/entity-relationships.md based on the SQLite schema in this OpenShelf Library. Document all entities (books, members, loans), their fields, relationships, constraints, and include a Mermaid ER diagram." --allow-all-tools --yolo 2>&1 | Tee-Object -FilePath "assets/outputs/step-06-data-models.txt"
```

**What Copilot does:** Creates a 161-line data model spec with:
- Mermaid ER diagram showing all 3 entities with typed fields and relationships
- Detailed field tables (type, constraints, defaults, descriptions)
- Relationship cardinality and FK references
- Index inventory and enumerated values
- 10 business rules extracted from model layer with enforcement locations

**Files created:** `specs/data/entity-relationships.md`

```powershell
git add specs/data/entity-relationships.md assets/outputs/step-06-data-models.txt
git commit -m "Step 06: Generate data model specification"
git tag step-06-data-models
```

---

### Step 7: Create Architecture Decision Records

**Prompt to GH Copilot CLI:**

```powershell
gh copilot -- -p "Create two Architecture Decision Records (ADRs) for the OpenShelf Library modernization: 1) ADR-001 at specs/decisions/001-framework-migration.md recommending migration from Express to Fastify, with pros/cons analysis. 2) ADR-002 at specs/decisions/002-database-migration.md recommending migration from SQLite to PostgreSQL, with pros/cons analysis." --allow-all-tools --yolo 2>&1 | Tee-Object -FilePath "assets/outputs/step-07-adrs.txt"
```

**What Copilot does:** Creates two ADRs:
- **001-framework-migration.md** — Express → Fastify: cites performance, built-in JSON Schema validation, async/await, OpenAPI integration
- **002-database-migration.md** — SQLite → PostgreSQL: cites cloud-native persistence, concurrent access, managed backups, Azure Flexible Server

**Files created:** `specs/decisions/001-framework-migration.md`, `specs/decisions/002-database-migration.md`

```powershell
git add specs/decisions/ assets/outputs/step-07-adrs.txt
git commit -m "Step 07: Create Architecture Decision Records"
git tag step-07-create-adrs
```

---

### Step 8: Refine Specs with Modernization Annotations

**Prompt to GH Copilot CLI:**

```powershell
gh copilot -- -p "Review and refine all the generated specifications in the specs/ directory. Add modernization annotations indicating: target framework (Fastify), target database (PostgreSQL), migration complexity per component, and recommended migration order. Update each spec file with these annotations." --allow-all-tools --yolo 2>&1 | Tee-Object -FilePath "assets/outputs/step-08-refine-specs.txt"
```

**What Copilot does:** Updates all 9 spec files with modernization annotations:
- Target Framework: Fastify
- Target Database: PostgreSQL
- Migration complexity per component (🟢 Low → 🟠 Medium-High)
- 7-phase migration order: Schema → Data Access → Framework → API → Config → Testing → Deployment

**Files modified:** All files in `specs/`

```powershell
git add specs/ assets/outputs/step-08-refine-specs.txt
git commit -m "Step 08: Refine specs with modernization annotations"
git tag step-08-refine-specs
```

---

### Step 9: Build Modern App from Specs

**Prompt to GH Copilot CLI:**

```powershell
gh copilot -- -p "Using the specifications in specs/ as the blueprint, scaffold a modern version of the OpenShelf Library in a modern/ directory. Use Fastify as the framework and include: package.json, basic server setup, route handlers matching the OpenAPI spec, and a migration script for PostgreSQL. Follow the architecture specification for component structure." --allow-all-tools --yolo 2>&1 | Tee-Object -FilePath "assets/outputs/step-09-build-from-specs.txt"
```

**What Copilot does:** Scaffolds 18 files in `modern/`:

```
modern/
├── package.json          # Fastify 5, pg, @fastify/swagger, @fastify/env
├── .env.example          # DATABASE_URL, PORT, HOST
└── src/
    ├── app.js            # Server entry point with plugin registration
    ├── plugins/          # env.js, db.js (pg Pool), swagger.js
    ├── schemas/          # JSON Schema for books, members, loans
    ├── models/           # Async data access with business rules & transactions
    ├── routes/           # REST routes under /api/v1/{books,members,loans}
    └── db/migrate.js     # PostgreSQL migration (ENUMs, IDENTITY PKs, updated_at)
```

Verify it builds:

```powershell
cd modern && npm install
```

**Key design decisions from specs:** `/api/v1` prefix, proper HTTP verbs, transactions for checkout/return, all 10 business rules implemented, PostgreSQL ENUMs, `/health` endpoint, Swagger UI at `/docs`.

```powershell
cd ..
git add modern/ assets/outputs/step-09-build-from-specs.txt
git commit -m "Step 09: Build modern app from specs"
git tag step-09-build-from-specs
```

---

### Step 10: Validate Implementation Against Specs

**Prompt to GH Copilot CLI:**

```powershell
gh copilot -- -p "Validate the modern/ implementation against the specifications in specs/. Check that: all API endpoints from the OpenAPI spec are implemented, data models match the entity-relationship spec, architecture matches the system overview. Create a validation report at specs/validation-report.md with pass/fail for each check." --allow-all-tools --yolo 2>&1 | Tee-Object -FilePath "assets/outputs/step-10-validation.txt"
```

**What Copilot does:** Creates `specs/validation-report.md` with pass/fail checks:

| Category | Pass | Fail | Notes |
|---|---|---|---|
| API Endpoints (18) | 15 | 3 | 3 "failures" are additive GET /:id endpoints |
| Data Model (12) | 12 | 0 | All tables match with PostgreSQL enhancements |
| Business Rules (10) | 10 | 0 | All rules implemented |
| Architecture (10) | 10 | 0 | Matches Fastify + PostgreSQL target |
| **Total** | **47** | **3** | **Overall: ✅ PASS** |

```powershell
git add specs/validation-report.md assets/outputs/step-10-validation.txt
git commit -m "Step 10: Validate implementation against specs"
git tag step-10-validate
```

---

### Push the Solution

```powershell
git push origin solution-final --tags
```

### Reviewing the Solution

To explore the solution step-by-step:

```powershell
git checkout step-01-explore-legacy-app   # See legacy app exploration
git checkout step-05-api-contracts        # See OpenAPI spec generation
git checkout step-09-build-from-specs     # See modern Fastify app
git checkout step-10-validate             # See validation report
git checkout solution-final               # See complete solution
```
