/**
 * PostgreSQL migration script for OpenShelf Library.
 *
 * Converts the SQLite schema to PostgreSQL with:
 * - GENERATED ALWAYS AS IDENTITY primary keys
 * - ENUM types for member_status and loan_status
 * - TIMESTAMPTZ with updated_at columns
 * - ON DELETE RESTRICT foreign keys
 * - Composite index on loans(book_id, status)
 *
 * Usage:
 *   DATABASE_URL=postgresql://user:pass@host:5432/openshelf node src/db/migrate.js
 */

import pg from 'pg';

const { Pool } = pg;

const MIGRATION_SQL = `
-- Drop existing objects if re-running migration
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TYPE IF EXISTS member_status CASCADE;
DROP TYPE IF EXISTS loan_status CASCADE;

-- Enum types
CREATE TYPE member_status AS ENUM ('active', 'inactive');
CREATE TYPE loan_status   AS ENUM ('active', 'returned', 'overdue');

-- Books
CREATE TABLE books (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title           TEXT NOT NULL,
    author          TEXT NOT NULL,
    isbn            TEXT UNIQUE,
    genre           TEXT,
    published_year  INTEGER,
    available_copies INTEGER NOT NULL DEFAULT 0,
    total_copies    INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Members
CREATE TABLE members (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    phone           TEXT,
    membership_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status          member_status NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Loans
CREATE TABLE loans (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book_id         INTEGER NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    member_id       INTEGER NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    loan_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE NOT NULL,
    return_date     DATE,
    status          loan_status NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_loans_status      ON loans(status);
CREATE INDEX idx_loans_due_date    ON loans(due_date);
CREATE INDEX idx_loans_book_status ON loans(book_id, status);
CREATE INDEX idx_books_genre       ON books(genre);
`;

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/openshelf';

  console.log('Connecting to PostgreSQL...');
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log('Running migration...');
    await pool.query(MIGRATION_SQL);
    console.log('Migration completed successfully.');
    console.log('Tables created: books, members, loans');
    console.log('Enums created: member_status, loan_status');
    console.log('Indexes created: idx_loans_status, idx_loans_due_date, idx_loans_book_status, idx_books_genre');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
