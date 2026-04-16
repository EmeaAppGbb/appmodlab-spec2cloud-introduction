export default class Book {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll(search = '') {
    if (search) {
      const term = `%${search}%`;
      const { rows } = await this.pool.query(
        `SELECT * FROM books
         WHERE title ILIKE $1 OR author ILIKE $1 OR genre ILIKE $1
         ORDER BY title`,
        [term],
      );
      return rows;
    }
    const { rows } = await this.pool.query('SELECT * FROM books ORDER BY title');
    return rows;
  }

  async findById(id) {
    const { rows } = await this.pool.query('SELECT * FROM books WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async create({ title, author, isbn, genre, published_year, total_copies = 1 }) {
    const { rows } = await this.pool.query(
      `INSERT INTO books (title, author, isbn, genre, published_year, available_copies, total_copies)
       VALUES ($1, $2, $3, $4, $5, $6, $6)
       RETURNING *`,
      [title, author, isbn || null, genre || null, published_year || null, total_copies],
    );
    return rows[0];
  }

  async update(id, { title, author, isbn, genre, published_year, total_copies }) {
    const existing = await this.findById(id);
    if (!existing) return null;

    let availableCopies = existing.available_copies;
    if (total_copies !== undefined) {
      const diff = total_copies - existing.total_copies;
      availableCopies = Math.max(0, existing.available_copies + diff);
    }

    const { rows } = await this.pool.query(
      `UPDATE books
       SET title = $1, author = $2, isbn = $3, genre = $4, published_year = $5,
           total_copies = $6, available_copies = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        title, author, isbn || null, genre || null, published_year || null,
        total_copies ?? existing.total_copies, availableCopies, id,
      ],
    );
    return rows[0];
  }

  async delete(id) {
    const { rows: activeLoans } = await this.pool.query(
      `SELECT id FROM loans WHERE book_id = $1 AND status IN ('active', 'overdue')`,
      [id],
    );
    if (activeLoans.length > 0) {
      throw new Error('Cannot delete book with active loans');
    }
    const { rowCount } = await this.pool.query('DELETE FROM books WHERE id = $1', [id]);
    return rowCount > 0;
  }

  async decrementAvailable(id) {
    await this.pool.query(
      'UPDATE books SET available_copies = available_copies - 1, updated_at = NOW() WHERE id = $1',
      [id],
    );
  }

  async incrementAvailable(id) {
    await this.pool.query(
      'UPDATE books SET available_copies = available_copies + 1, updated_at = NOW() WHERE id = $1',
      [id],
    );
  }
}
