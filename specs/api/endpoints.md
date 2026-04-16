# API Endpoint Specification — OpenShelf Library

> **Note:** The legacy application serves HTML, not JSON. These endpoints are documented as-is to inform the modern API design.

## Base URL

```
http://localhost:3000
```

## Books (`/books`)

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/books` | List all books, optional `?search=` query | — | HTML: book catalog page |
| GET | `/books/new` | Show new-book form | — | HTML: empty book form |
| GET | `/books/:id/edit` | Show edit form for a book | — | HTML: pre-filled book form |
| POST | `/books` | Create a new book | `title`, `author`, `isbn`, `genre`, `published_year`, `total_copies` | Redirect → `/books` |
| POST | `/books/:id` | Update an existing book | `title`, `author`, `isbn`, `genre`, `published_year`, `total_copies` | Redirect → `/books` |
| POST | `/books/:id/delete` | Delete a book (fails if active loans) | — | Redirect → `/books` |

## Members (`/members`)

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/members` | List members, optional `?include_inactive=true` | — | HTML: members list |
| GET | `/members/new` | Show new-member form | — | HTML: empty member form |
| GET | `/members/:id/edit` | Show edit form for a member | — | HTML: pre-filled member form |
| POST | `/members` | Create a new member | `name`, `email`, `phone`, `membership_date` | Redirect → `/members` |
| POST | `/members/:id` | Update a member | `name`, `email`, `phone`, `status` | Redirect → `/members` |
| POST | `/members/:id/deactivate` | Deactivate (fails if active loans) | — | Redirect → `/members` |
| POST | `/members/:id/delete` | Delete (fails if any loan history) | — | Redirect → `/members` |

## Loans (`/loans`)

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/loans` | List loans, optional `?filter=active\|all` | — | HTML: loans page with stats |
| GET | `/loans/checkout` | Show checkout form | — | HTML: checkout form (available books + active members) |
| POST | `/loans/checkout` | Check out a book to a member | `book_id`, `member_id`, `due_date` | Redirect → `/loans` |
| POST | `/loans/:id/return` | Return a book | — | Redirect → `/loans` |

## Home (`/`)

| Method | Path | Description | Response |
|---|---|---|---|
| GET | `/` | Dashboard with aggregate stats (total books, active members, active loans, overdue loans) | HTML: homepage |

## Business Rules Enforced by Endpoints

1. **Book deletion blocked** when the book has active loans.
2. **Member deactivation blocked** when the member has active loans.
3. **Member deletion blocked** when the member has any loan history.
4. **Checkout blocked** when `available_copies` ≤ 0.
5. **Return idempotency** — returning an already-returned loan raises an error.
6. **Overdue auto-detection** — visiting `/loans` triggers `updateOverdueStatus()` which marks past-due active loans as `overdue`.
7. **Default loan period** — 14 days if no `due_date` is supplied.
