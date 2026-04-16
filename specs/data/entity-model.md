# Data Model Specification — OpenShelf Library

---

## Modernization Annotations

| Property | Value |
|---|---|
| **Target Framework** | Fastify |
| **Target Database** | PostgreSQL |
| **Migration Complexity** | 🟡 Medium |
| **Migration Order** | 1 of 7 — first priority; all other components depend on the database layer |

### Schema Migration Notes (SQLite → PostgreSQL)

| SQLite Construct | PostgreSQL Equivalent | Affected Tables |
|---|---|---|
| `INTEGER PRIMARY KEY AUTOINCREMENT` | `INTEGER GENERATED ALWAYS AS IDENTITY` (or `SERIAL`) | books, members, loans |
| `TEXT` (for enums) | `TEXT` with `CHECK` or custom `ENUM` type | members.status, loans.status |
| `DATETIME DEFAULT CURRENT_TIMESTAMP` | `TIMESTAMPTZ DEFAULT NOW()` | All tables |
| `DATE DEFAULT CURRENT_DATE` | `DATE DEFAULT CURRENT_DATE` | members.membership_date, loans.loan_date |
| Implicit rowid index | Explicit `PRIMARY KEY` (identical behavior) | All tables |
| `UNIQUE` constraint on TEXT | `UNIQUE` constraint (identical) | books.isbn, members.email |

### Per-Table Migration Complexity

| Table | Complexity | Notes |
|---|---|---|
| books | 🟢 Low | Direct mapping; change PK strategy and timestamp type |
| members | 🟢 Low | Direct mapping; consider PostgreSQL `ENUM` for status |
| loans | 🟡 Medium | Foreign keys need `ON DELETE RESTRICT`; date functions differ; add index for compound queries |

### Additional PostgreSQL Recommendations

- Add `updated_at TIMESTAMPTZ DEFAULT NOW()` column to all tables (addresses tech debt TD-19)
- Use `ENUM` types for `member_status` (`active`, `inactive`) and `loan_status` (`active`, `returned`, `overdue`)
- Add `ON DELETE RESTRICT` to foreign keys (currently enforced in application code only)
- Consider `UUID` primary keys for cloud-native scalability (optional, increases migration complexity)
- Use `pg` connection pool with Fastify lifecycle hooks for proper startup/shutdown

---

## Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│      books       │       │     members      │
├──────────────────┤       ├──────────────────┤
│ id           PK  │       │ id           PK  │
│ title        NN  │       │ name         NN  │
│ author       NN  │       │ email     NN UQ  │
│ isbn         UQ  │       │ phone          │
│ genre            │       │ membership_date │
│ published_year   │       │ status (enum)   │
│ available_copies │       │ created_at      │
│ total_copies     │       └───────┬──────────┘
│ created_at       │               │
└───────┬──────────┘               │
        │                          │
        │  1           N           │  1           N
        └──────────┐  ┌───────────┘
                   │  │
              ┌────▼──▼───────────┐
              │      loans        │
              ├───────────────────┤
              │ id            PK  │
              │ book_id    FK→books│
              │ member_id FK→members│
              │ loan_date         │
              │ due_date      NN  │
              │ return_date       │
              │ status (enum)     │
              │ created_at        │
              └───────────────────┘
```

## Table Definitions

### books

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | — | Unique book identifier |
| title | TEXT | NOT NULL | — | Book title |
| author | TEXT | NOT NULL | — | Author name |
| isbn | TEXT | UNIQUE | — | ISBN code |
| genre | TEXT | — | — | Genre category |
| published_year | INTEGER | — | — | Year of publication |
| available_copies | INTEGER | — | 0 | Copies currently available |
| total_copies | INTEGER | — | 0 | Total copies owned |
| created_at | DATETIME | — | CURRENT_TIMESTAMP | Record creation timestamp |

### members

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | — | Unique member identifier |
| name | TEXT | NOT NULL | — | Member full name |
| email | TEXT | UNIQUE, NOT NULL | — | Email address |
| phone | TEXT | — | — | Phone number |
| membership_date | DATE | — | CURRENT_DATE | Date of membership |
| status | TEXT | CHECK('active','inactive') | 'active' | Account status |
| created_at | DATETIME | — | CURRENT_TIMESTAMP | Record creation timestamp |

### loans

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | — | Unique loan identifier |
| book_id | INTEGER | NOT NULL, FK → books(id) | — | Borrowed book |
| member_id | INTEGER | NOT NULL, FK → members(id) | — | Borrowing member |
| loan_date | DATE | — | CURRENT_DATE | Date of checkout |
| due_date | DATE | NOT NULL | — | Expected return date |
| return_date | DATE | — | — | Actual return date (NULL = not returned) |
| status | TEXT | CHECK('active','returned','overdue') | 'active' | Loan state |
| created_at | DATETIME | — | CURRENT_TIMESTAMP | Record creation timestamp |

## Indexes

| Index | Table | Column(s) | Purpose |
|---|---|---|---|
| idx_loans_status | loans | status | Fast filtering by loan state |
| idx_loans_due_date | loans | due_date | Overdue detection queries |
| idx_books_genre | books | genre | Genre-based search |

## Relationships

| Relationship | Cardinality | Description |
|---|---|---|
| books → loans | 1:N | A book can have many loans over time |
| members → loans | 1:N | A member can have many loans over time |

## Data Integrity Rules

1. A book cannot be deleted while it has active loans (`book.delete` checks).
2. A member cannot be deactivated while they have active loans (`member.deactivate` checks).
3. A member cannot be deleted if they have any loan history (`member.delete` checks).
4. `available_copies` is decremented on checkout and incremented on return.
5. When `total_copies` is updated, `available_copies` is adjusted by the difference (floored at 0).
