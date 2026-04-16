# OpenShelf Library — Spec2Cloud Analysis Report

> **Generated:** 2026-04-16  
> **Methodology:** Spec2Cloud — Extract specifications from legacy code to drive cloud-native modernization  
> **Version Analyzed:** 1.0.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Component Inventory](#4-component-inventory)
5. [Database Schema & Data Model](#5-database-schema--data-model)
6. [Route & Endpoint Map](#6-route--endpoint-map)
7. [Data Flows](#7-data-flows)
8. [Business Logic Summary](#8-business-logic-summary)
9. [View Layer Analysis](#9-view-layer-analysis)
10. [Dependency Analysis](#10-dependency-analysis)
11. [Technical Debt & Risk Assessment](#11-technical-debt--risk-assessment)
12. [Modernization Readiness](#12-modernization-readiness)

---

## 1. Executive Summary

**OpenShelf Library** is a monolithic server-rendered web application for community library management. It provides book catalog management, member registration, and loan tracking through a browser-based UI. The application follows a classic **MVC (Model-View-Controller)** pattern built on Node.js/Express with EJS templates and an embedded SQLite database.

### Key Metrics

| Metric | Value |
|---|---|
| Source files | 13 (3 models, 3 routes, 6 views, 1 entry point) |
| Database tables | 3 (`books`, `members`, `loans`) |
| HTTP routes | 16 endpoints |
| Runtime dependencies | 4 (`express`, `body-parser`, `ejs`, `better-sqlite3`) |
| Lines of code (approx.) | ~750 (JS) + ~550 (EJS templates) |
| Test coverage | **None** — no test framework or test files exist |

---

## 2. System Architecture

### 2.1 Architecture Pattern

The application is a **single-process monolith** with tightly coupled layers:

```
┌─────────────────────────────────────────────────┐
│                   Browser (Client)               │
│        Bootstrap 4.5.2 + jQuery 3.5.1           │
└──────────────────────┬──────────────────────────┘
                       │  HTTP (HTML forms / GET)
┌──────────────────────▼──────────────────────────┐
│               Express.js Server                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Routes   │  │  Routes   │  │  Routes   │      │
│  │ /books    │  │ /members  │  │ /loans    │      │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘      │
│        │             │             │             │
│  ┌─────▼────┐  ┌─────▼────┐  ┌─────▼────┐      │
│  │  Model    │  │  Model    │  │  Model    │      │
│  │  Book     │  │  Member   │  │  Loan     │      │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘      │
│        │             │             │             │
│  ┌─────▼─────────────▼─────────────▼────┐       │
│  │      SQLite (better-sqlite3)          │       │
│  │      database/library.db              │       │
│  └──────────────────────────────────────┘       │
│                                                  │
│  ┌──────────────────────────────────────┐       │
│  │       EJS Template Engine             │       │
│  │  views/  (layout, books, members,     │       │
│  │          loans)                        │       │
│  └──────────────────────────────────────┘       │
└──────────────────────────────────────────────────┘
```

### 2.2 Process Model

- **Single-threaded** Node.js process on port `3000` (hardcoded)
- **Synchronous** database access via `better-sqlite3` (blocking I/O)
- **No clustering**, worker threads, or horizontal scaling
- **Graceful shutdown** handler closes DB on `SIGINT`

### 2.3 Layer Boundaries

| Layer | Directory | Responsibility |
|---|---|---|
| Entry point | `src/app.js` | Server bootstrap, DB init, middleware, home route |
| Routes | `src/routes/` | HTTP handling, request parsing, redirect logic |
| Models | `src/models/` | Data access, business rules, SQL queries |
| Views | `src/views/` | HTML rendering via EJS templates |
| Database | `database/` | Schema DDL, seed data, SQLite file |

---

## 3. Technology Stack

| Component | Technology | Version | Notes |
|---|---|---|---|
| Runtime | Node.js | Not pinned | No `.nvmrc` or `engines` field |
| Framework | Express.js | ^4.18.2 | Mature, widely supported |
| Template engine | EJS | ^3.1.9 | Server-side rendering |
| Database | SQLite | via better-sqlite3 ^12.9.0 | Embedded, file-based |
| Body parsing | body-parser | ^1.20.2 | Redundant — Express 4.16+ has built-in parser |
| CSS framework | Bootstrap | 4.5.2 (CDN) | Loaded from stackpath CDN |
| JavaScript (client) | jQuery | 3.5.1 (CDN) | Loaded from jQuery CDN |
| Dev tooling | nodemon | ^3.0.2 (dev) | Auto-restart on file changes |

---

## 4. Component Inventory

### 4.1 Models

#### `Book` (`src/models/book.js`)
| Method | Description |
|---|---|
| `findAll(search)` | List all books; optional LIKE search on title/author/genre |
| `findById(id)` | Single book lookup |
| `create(book)` | Insert; sets `available_copies = total_copies` |
| `update(id, book)` | Update; recalculates `available_copies` based on copy diff |
| `delete(id)` | Delete with active-loan guard |
| `decrementAvailable(id)` | Decrease available count by 1 |
| `incrementAvailable(id)` | Increase available count by 1 |

#### `Member` (`src/models/member.js`)
| Method | Description |
|---|---|
| `findAll(includeInactive)` | List members; optionally include inactive |
| `findById(id)` | Single member lookup |
| `create(member)` | Insert with defaults for date and status |
| `update(id, member)` | Update name, email, phone, status |
| `deactivate(id)` | Soft-delete with active-loan guard |
| `delete(id)` | Hard delete with any-loan-history guard |

#### `Loan` (`src/models/loan.js`)
| Method | Description |
|---|---|
| `findAll(status)` | List loans with joined book/member data; optional status filter |
| `findById(id)` | Single loan with joins |
| `findActiveByMember(memberId)` | Active loans for a specific member |
| `create(loan)` | Checkout: availability check, insert, decrement book copies |
| `returnBook(id)` | Return: validate status, set return date, increment book copies |
| `updateOverdueStatus()` | Batch-mark overdue loans based on current date |
| `calculateDueDate(days)` | Utility: compute due date (default 14 days) |
| `getStatistics()` | Count active, overdue, returned loans |

### 4.2 Routes

| File | Mount | Endpoints |
|---|---|---|
| `src/app.js` | `/` | Home dashboard with stats |
| `src/routes/books.js` | `/books` | CRUD for books (6 routes) |
| `src/routes/members.js` | `/members` | CRUD + deactivate for members (7 routes) |
| `src/routes/loans.js` | `/loans` | Loan listing, checkout, return (4 routes) |

### 4.3 Views (EJS Templates)

| Template | Purpose |
|---|---|
| `views/layout.ejs` | Shared layout with navbar (used only by home route) |
| `views/books/index.ejs` | Book catalog with search, table, edit/delete actions |
| `views/books/form.ejs` | Add/edit book form |
| `views/members/index.ejs` | Member list with active/inactive toggle |
| `views/members/form.ejs` | Add/edit member form |
| `views/loans/index.ejs` | Loan list with stats cards and status filter |
| `views/loans/checkout.ejs` | Checkout form with book/member dropdowns |

---

## 5. Database Schema & Data Model

### 5.1 Entity-Relationship Diagram

```
┌─────────────────────┐       ┌──────────────────────┐
│       books          │       │       members         │
├─────────────────────┤       ├──────────────────────┤
│ id (PK)             │       │ id (PK)              │
│ title (NOT NULL)    │       │ name (NOT NULL)       │
│ author (NOT NULL)   │       │ email (UNIQUE, NN)    │
│ isbn (UNIQUE)       │       │ phone                 │
│ genre               │       │ membership_date       │
│ published_year      │       │ status (CHECK)        │
│ available_copies    │       │ created_at            │
│ total_copies        │       └───────────┬──────────┘
│ created_at          │                   │
└──────────┬──────────┘                   │
           │                              │
           │        ┌─────────────────────┘
           │        │
     ┌─────▼────────▼─────┐
     │       loans         │
     ├────────────────────┤
     │ id (PK)            │
     │ book_id (FK→books) │
     │ member_id (FK→members)│
     │ loan_date           │
     │ due_date (NOT NULL) │
     │ return_date         │
     │ status (CHECK)      │
     │ created_at          │
     └────────────────────┘
```

### 5.2 Table Details

#### `books`
| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | — |
| `title` | TEXT | NOT NULL | — |
| `author` | TEXT | NOT NULL | — |
| `isbn` | TEXT | UNIQUE | — |
| `genre` | TEXT | — | — |
| `published_year` | INTEGER | — | — |
| `available_copies` | INTEGER | — | 0 |
| `total_copies` | INTEGER | — | 0 |
| `created_at` | DATETIME | — | CURRENT_TIMESTAMP |

#### `members`
| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | — |
| `name` | TEXT | NOT NULL | — |
| `email` | TEXT | UNIQUE, NOT NULL | — |
| `phone` | TEXT | — | — |
| `membership_date` | DATE | — | CURRENT_DATE |
| `status` | TEXT | CHECK('active','inactive') | 'active' |
| `created_at` | DATETIME | — | CURRENT_TIMESTAMP |

#### `loans`
| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | — |
| `book_id` | INTEGER | NOT NULL, FK→books | — |
| `member_id` | INTEGER | NOT NULL, FK→members | — |
| `loan_date` | DATE | — | CURRENT_DATE |
| `due_date` | DATE | NOT NULL | — |
| `return_date` | DATE | — | — |
| `status` | TEXT | CHECK('active','returned','overdue') | 'active' |
| `created_at` | DATETIME | — | CURRENT_TIMESTAMP |

### 5.3 Indexes

| Index | Table | Column(s) |
|---|---|---|
| `idx_loans_status` | loans | status |
| `idx_loans_due_date` | loans | due_date |
| `idx_books_genre` | books | genre |

### 5.4 Seed Data

- **20 books** across genres: Fiction, Dystopian, Romance, Adventure, Fantasy, Technology
- **10 members** (9 active, 1 inactive)
- **15 loans** (5 active, 4 overdue, 6 returned) using relative date offsets

---

## 6. Route & Endpoint Map

### 6.1 Complete Route Table

| Method | Path | Handler | Action |
|---|---|---|---|
| `GET` | `/` | `app.js` (inline) | Dashboard with aggregate stats |
| `GET` | `/books` | `books.js` | List all books (with optional `?search=`) |
| `GET` | `/books/new` | `books.js` | Render add-book form |
| `GET` | `/books/:id/edit` | `books.js` | Render edit-book form |
| `POST` | `/books` | `books.js` | Create new book |
| `POST` | `/books/:id` | `books.js` | Update existing book |
| `POST` | `/books/:id/delete` | `books.js` | Delete book |
| `GET` | `/members` | `members.js` | List members (with optional `?include_inactive=true`) |
| `GET` | `/members/new` | `members.js` | Render add-member form |
| `GET` | `/members/:id/edit` | `members.js` | Render edit-member form |
| `POST` | `/members` | `members.js` | Create new member |
| `POST` | `/members/:id` | `members.js` | Update existing member |
| `POST` | `/members/:id/deactivate` | `members.js` | Soft-deactivate member |
| `POST` | `/members/:id/delete` | `members.js` | Hard-delete member |
| `GET` | `/loans` | `loans.js` | List loans (with `?filter=active\|overdue\|returned\|all`) |
| `GET` | `/loans/checkout` | `loans.js` | Render checkout form |
| `POST` | `/loans/checkout` | `loans.js` | Create loan (checkout book) |
| `POST` | `/loans/:id/return` | `loans.js` | Return a loaned book |

### 6.2 API Style

- **No REST API** — all interactions are HTML form-based (POST with redirect pattern)
- Uses `POST` for updates/deletes instead of `PUT`/`PATCH`/`DELETE` verbs
- No JSON API endpoints; all responses are rendered HTML or redirects
- No API versioning or content negotiation

---

## 7. Data Flows

### 7.1 Book Checkout Flow

```
User selects book + member on /loans/checkout form
  │
  ▼
POST /loans/checkout
  │
  ▼
Loan.create()
  ├── Verify book exists and available_copies > 0
  ├── Calculate due_date (default: today + 14 days)
  ├── INSERT INTO loans (book_id, member_id, loan_date, due_date, status='active')
  └── UPDATE books SET available_copies = available_copies - 1
  │
  ▼
Redirect → GET /loans
```

### 7.2 Book Return Flow

```
User clicks "Return" on loan row
  │
  ▼
POST /loans/:id/return
  │
  ▼
Loan.returnBook(id)
  ├── Verify loan exists and status ≠ 'returned'
  ├── UPDATE loans SET return_date = today, status = 'returned'
  └── UPDATE books SET available_copies = available_copies + 1
  │
  ▼
Redirect → GET /loans
```

### 7.3 Overdue Detection Flow

```
GET /loans (on every page load)
  │
  ▼
Loan.updateOverdueStatus()
  └── UPDATE loans SET status = 'overdue'
      WHERE status = 'active' AND due_date < today AND return_date IS NULL
  │
  ▼
Render loan list with updated statuses
```

> ⚠️ **Note:** Overdue detection is **passive** — it only runs when the loans page is viewed. There is no background scheduler or cron job.

### 7.4 Book Copy Tracking Flow

```
On book create:   available_copies = total_copies
On book update:   available_copies += (new_total - old_total), clamped to ≥ 0
On checkout:      available_copies -= 1
On return:        available_copies += 1
On delete:        blocked if active loans exist
```

---

## 8. Business Logic Summary

### 8.1 Business Rules

| Rule | Enforcement | Location |
|---|---|---|
| Book cannot be deleted with active loans | Exception in model | `Book.delete()` |
| Member cannot be deactivated with active loans | Exception in model | `Member.deactivate()` |
| Member cannot be deleted with any loan history | Exception in model | `Member.delete()` |
| Book checkout requires `available_copies > 0` | Exception in model | `Loan.create()` |
| Already-returned book cannot be returned again | Exception in model | `Loan.returnBook()` |
| Default loan period is 14 days | Default in model | `Loan.calculateDueDate()` |
| Member status is either `active` or `inactive` | CHECK constraint | `schema.sql` |
| Loan status is `active`, `returned`, or `overdue` | CHECK constraint | `schema.sql` |
| ISBN must be unique | UNIQUE constraint | `schema.sql` |
| Member email must be unique | UNIQUE constraint | `schema.sql` |

### 8.2 Missing Business Rules (Gaps)

- No **loan limit** per member (a member can checkout unlimited books)
- No **renewal** mechanism for active loans
- No **fine calculation** for overdue books
- No **reservation/hold** system for unavailable books
- No **authentication or authorization** — any user can perform all operations
- `available_copies` can go **negative** if decremented without bound check in `decrementAvailable()`
- Overdue status is only updated on **loan page views**, not by a scheduler

---

## 9. View Layer Analysis

### 9.1 Template Architecture

- Each view is a **standalone full HTML document** (duplicated `<html>`, `<head>`, `<nav>`)
- `layout.ejs` exists but is **only used by the home route** via inline HTML injection
- Book, member, and loan views **do not use the layout** — they duplicate the navbar and boilerplate
- Bootstrap 4.5.2 and jQuery 3.5.1 loaded from CDN in every template

### 9.2 Client-Side Behavior

- **Minimal JavaScript** — only Bootstrap's collapse toggle and `confirm()` dialogs
- No AJAX calls; all interactions use full-page form submissions
- No client-side validation beyond HTML5 `required` and `type` attributes
- No CSRF protection on forms

---

## 10. Dependency Analysis

### 10.1 Runtime Dependencies

| Package | Purpose | Risk |
|---|---|---|
| `express@^4.18.2` | Web framework | Low — stable, widely used |
| `better-sqlite3@^12.9.0` | SQLite binding (native) | Medium — native addon, requires build tools |
| `ejs@^3.1.9` | Template engine | Low — stable |
| `body-parser@^1.20.2` | Request parsing | Low — but **redundant** (built into Express 4.16+) |

### 10.2 Dev Dependencies

| Package | Purpose |
|---|---|
| `nodemon@^3.0.2` | Auto-restart on file change |

### 10.3 Missing Dependencies (for production)

- No **logging** framework (uses `console.log`)
- No **error handling middleware** (Express default error page)
- No **input validation** library (e.g., Joi, express-validator)
- No **security middleware** (e.g., helmet, cors, rate limiting)
- No **test framework** (e.g., Jest, Mocha)
- No **linter** configuration (ESLint, Prettier)

### 10.4 External CDN Dependencies

| Resource | CDN | Risk |
|---|---|---|
| Bootstrap 4.5.2 CSS | stackpath.bootstrapcdn.com | Medium — CDN outage breaks styling |
| jQuery 3.5.1 | code.jquery.com | Medium — CDN outage breaks interactions |
| Bootstrap 4.5.2 JS | cdn.jsdelivr.net | Medium — CDN outage breaks responsive nav |

---

## 11. Technical Debt & Risk Assessment

### 11.1 Critical Issues

| # | Issue | Impact | Location |
|---|---|---|---|
| **TD-01** | No authentication or authorization | Any user can modify/delete all data | All routes |
| **TD-02** | No input sanitization or validation | SQL injection mitigated by prepared statements, but no business validation (e.g., email format, phone format) | All routes |
| **TD-03** | No CSRF protection | Cross-site request forgery possible on all POST endpoints | All forms |
| **TD-04** | No error handling middleware | Unhandled errors crash the process; errors return raw messages to users | `app.js` |
| **TD-05** | Hardcoded port `3000` | Cannot configure via environment | `src/app.js:8` |

### 11.2 High-Priority Issues

| # | Issue | Impact | Location |
|---|---|---|---|
| **TD-06** | No test suite | Zero confidence in refactoring; regression risk | Project-wide |
| **TD-07** | Database operations not wrapped in transactions | Checkout/return involve multi-table writes that can partially fail | `Loan.create()`, `Loan.returnBook()` |
| **TD-08** | Overdue detection only runs on page view | Overdue status is stale unless someone visits `/loans` | `loans.js:10` |
| **TD-09** | `decrementAvailable()` / `incrementAvailable()` have no bounds check | Available copies can go negative or exceed total | `book.js:72-78` |
| **TD-10** | Layout template not used consistently | Navbar/boilerplate duplicated across 6 templates | All view files |

### 11.3 Medium-Priority Issues

| # | Issue | Impact | Location |
|---|---|---|---|
| **TD-11** | `body-parser` is redundant | Unnecessary dependency; Express has built-in equivalent | `app.js:2` |
| **TD-12** | Model instantiated per request | `new Book(req.app.locals.db)` on every route handler | All routes |
| **TD-13** | Home route contains inline HTML | Embedded HTML string in route handler, bypasses template benefits | `app.js:53-92` |
| **TD-14** | No pagination on list endpoints | Performance degrades with large datasets | All list routes |
| **TD-15** | No logging framework | Only `console.log`; no structured logs for production | Project-wide |
| **TD-16** | SQLite file-based DB | No concurrent write support; not suitable for multi-instance deployment | `database/library.db` |
| **TD-17** | No `.env` or config management | All config is hardcoded | `app.js` |
| **TD-18** | Static file path `/public` configured but directory doesn't exist | `express.static` middleware serves nothing | `app.js:40` |
| **TD-19** | No `updated_at` column on any table | Cannot track when records were last modified | `schema.sql` |
| **TD-20** | Semver ranges use `^` (caret) | Minor/patch updates may introduce breaking changes | `package.json` |

### 11.4 Debt Summary

```
Critical:  5 items  (security, stability)
High:      5 items  (data integrity, testing)
Medium:   10 items  (maintainability, scalability)
────────────────────
Total:    20 items
```

---

## 12. Modernization Readiness

### 12.1 Strengths for Modernization

- ✅ **Clean MVC separation** — models, routes, and views are in distinct directories
- ✅ **Simple data model** — 3 entities with clear relationships; easy to migrate
- ✅ **No external service dependencies** — self-contained; straightforward to lift
- ✅ **Prepared statements used** — SQL injection risk is mitigated
- ✅ **Business rules in models** — logic is centralized, not scattered across routes
- ✅ **Small codebase** — ~750 lines JS makes full comprehension feasible

### 12.2 Barriers to Modernization

- ❌ **No API layer** — UI is tightly coupled to server rendering; no REST/GraphQL API to preserve
- ❌ **No tests** — refactoring without a safety net
- ❌ **SQLite is embedded** — cannot be shared across multiple service instances
- ❌ **Synchronous DB driver** — `better-sqlite3` blocks the event loop
- ❌ **No configuration externalization** — port, DB path, and CDN URLs are hardcoded

### 12.3 Recommended Modernization Path

Based on the `spec2cloud.config.json` target of **Azure App Service**:

1. **Extract OpenAPI specification** from current routes → `specs/api/`
2. **Document entity model** with relationships → `specs/data/`
3. **Add REST API endpoints** returning JSON alongside existing HTML views
4. **Replace SQLite** with Azure SQL or PostgreSQL for multi-instance support
5. **Externalize configuration** via environment variables
6. **Add authentication** (Azure AD / Entra ID integration)
7. **Add test suite** before any structural refactoring
8. **Decouple frontend** — move to a SPA or static site consuming the API
9. **Containerize** with Docker for consistent deployment
10. **Deploy to Azure App Service** with managed database

### 12.4 Component Migration Map

| Current Component | Target (Azure) |
|---|---|
| Node.js + Express | Azure App Service (Node.js) |
| SQLite file DB | Azure Database for PostgreSQL / Azure SQL |
| EJS templates | Static SPA (React/Vue) or server-rendered |
| CDN-loaded Bootstrap | Azure CDN or bundled assets |
| File-based sessions | Azure Cache for Redis (if sessions added) |
| No auth | Azure Entra ID / MSAL |
| console.log | Application Insights |

---

*This analysis was generated using the Spec2Cloud methodology — extracting specifications from the legacy codebase to inform and drive a modern cloud-native rebuild.*
