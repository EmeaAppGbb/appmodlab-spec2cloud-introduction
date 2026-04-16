# System Architecture Overview — OpenShelf Library

## 1. Summary

OpenShelf Library is a server-rendered Node.js Express application that manages a community library's books, members, and loans. It uses SQLite for persistence, EJS for templating, and Bootstrap for styling.

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────┐
│                   Browser (Client)                │
│         HTML pages served by Express/EJS          │
└────────────────────┬─────────────────────────────┘
                     │  HTTP (port 3000)
┌────────────────────▼─────────────────────────────┐
│               Express.js Server                   │
│                                                   │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐         │
│  │ /books  │  │ /members │  │ /loans  │  Routes  │
│  └────┬────┘  └────┬─────┘  └────┬────┘         │
│       │            │             │                │
│  ┌────▼────┐  ┌────▼─────┐  ┌───▼────┐          │
│  │  Book   │  │  Member  │  │  Loan  │  Models   │
│  └────┬────┘  └────┬─────┘  └───┬────┘          │
│       │            │             │                │
│  ┌────▼────────────▼─────────────▼────┐          │
│  │       better-sqlite3 (sync)        │          │
│  └────────────────┬───────────────────┘          │
└───────────────────┼──────────────────────────────┘
                    │
         ┌──────────▼──────────┐
         │   database/         │
         │   library.db        │
         │   (SQLite file)     │
         └─────────────────────┘
```

## 3. Component Inventory

| Component | Technology | Location | Purpose |
|---|---|---|---|
| Web Server | Express.js 4.x | `src/app.js` | HTTP server, routing, middleware |
| Book Routes | Express Router | `src/routes/books.js` | CRUD endpoints for books |
| Member Routes | Express Router | `src/routes/members.js` | CRUD endpoints for members |
| Loan Routes | Express Router | `src/routes/loans.js` | Checkout, return, listing |
| Book Model | Class / better-sqlite3 | `src/models/book.js` | Book queries & business logic |
| Member Model | Class / better-sqlite3 | `src/models/member.js` | Member queries & business logic |
| Loan Model | Class / better-sqlite3 | `src/models/loan.js` | Loan queries, overdue detection |
| Views | EJS templates | `src/views/` | Server-rendered HTML pages |
| Database | SQLite 3 | `database/library.db` | Persistent storage |

## 4. Key Architectural Characteristics

- **Monolithic** — Single process handles all HTTP requests, rendering, and database access.
- **Synchronous I/O** — Uses `better-sqlite3` which is synchronous; no async/await needed for DB.
- **Server-Side Rendering** — All HTML is rendered on the server via EJS; no SPA or client-side framework.
- **No Authentication** — The application has no auth layer; all endpoints are publicly accessible.
- **No REST API** — Routes return rendered HTML, not JSON. Form submissions use `POST` with redirects.
- **Auto-initialization** — Database is created and seeded on first run if `library.db` is missing.

## 5. Request Flow

1. Browser sends HTTP request to Express on port 3000.
2. Express matches the route (`/books`, `/members`, `/loans`, or `/`).
3. Route handler instantiates the relevant Model class, passing `db` from `app.locals`.
4. Model executes synchronous SQL via `better-sqlite3`.
5. Route handler passes data to an EJS template.
6. Express sends rendered HTML back to the browser.

## 6. Dependencies

| Package | Version | Role |
|---|---|---|
| express | ^4.18.2 | Web framework |
| better-sqlite3 | ^12.9.0 | SQLite driver (sync) |
| ejs | ^3.1.9 | Template engine |
| body-parser | ^1.20.2 | Parse form/JSON bodies |
| nodemon | ^3.0.2 | Dev auto-restart (devDep) |
