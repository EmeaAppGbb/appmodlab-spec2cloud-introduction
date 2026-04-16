export default class Loan {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll(status) {
    let query = `
      SELECT l.*, b.title, b.author, m.name AS member_name, m.email
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN members m ON l.member_id = m.id`;
    const params = [];

    if (status && status !== 'all') {
      query += ' WHERE l.status = $1';
      params.push(status);
    }
    query += ' ORDER BY l.loan_date DESC';

    const { rows } = await this.pool.query(query, params);
    return rows;
  }

  async findById(id) {
    const { rows } = await this.pool.query(
      `SELECT l.*, b.title, b.author, m.name AS member_name, m.email
       FROM loans l
       JOIN books b ON l.book_id = b.id
       JOIN members m ON l.member_id = m.id
       WHERE l.id = $1`,
      [id],
    );
    return rows[0] || null;
  }

  async findActiveByMember(memberId) {
    const { rows } = await this.pool.query(
      `SELECT * FROM loans WHERE member_id = $1 AND status IN ('active', 'overdue')`,
      [memberId],
    );
    return rows;
  }

  async create({ book_id, member_id, due_date }) {
    const { rows: [book] } = await this.pool.query(
      'SELECT available_copies FROM books WHERE id = $1',
      [book_id],
    );
    if (!book) throw new Error('Book not found');
    if (book.available_copies <= 0) throw new Error('Book not available for checkout');

    const loanDueDate = due_date || this.calculateDueDate();

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO loans (book_id, member_id, due_date)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [book_id, member_id, loanDueDate],
      );
      await client.query(
        'UPDATE books SET available_copies = available_copies - 1, updated_at = NOW() WHERE id = $1',
        [book_id],
      );
      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async returnBook(id) {
    const loan = await this.findById(id);
    if (!loan) throw new Error('Loan not found');
    if (loan.status === 'returned') throw new Error('Book already returned');

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `UPDATE loans
         SET return_date = CURRENT_DATE, status = 'returned', updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id],
      );
      await client.query(
        'UPDATE books SET available_copies = available_copies + 1, updated_at = NOW() WHERE id = $1',
        [loan.book_id],
      );
      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateOverdueStatus() {
    const { rowCount } = await this.pool.query(
      `UPDATE loans SET status = 'overdue', updated_at = NOW()
       WHERE status = 'active' AND due_date < CURRENT_DATE`,
    );
    return rowCount;
  }

  calculateDueDate(days = 14) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  async getStatistics() {
    const { rows } = await this.pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'active')   AS active,
        COUNT(*) FILTER (WHERE status = 'overdue')   AS overdue,
        COUNT(*) FILTER (WHERE status = 'returned')  AS returned
      FROM loans
    `);
    return {
      active: parseInt(rows[0].active, 10),
      overdue: parseInt(rows[0].overdue, 10),
      returned: parseInt(rows[0].returned, 10),
    };
  }
}
