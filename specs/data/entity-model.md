# Data Model Specification — OpenShelf Library

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
