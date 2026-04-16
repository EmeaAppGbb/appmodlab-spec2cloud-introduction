export default class Member {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll(includeInactive = false) {
    const query = includeInactive
      ? 'SELECT * FROM members ORDER BY name'
      : `SELECT * FROM members WHERE status = 'active' ORDER BY name`;
    const { rows } = await this.pool.query(query);
    return rows;
  }

  async findById(id) {
    const { rows } = await this.pool.query('SELECT * FROM members WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async create({ name, email, phone, membership_date }) {
    const { rows } = await this.pool.query(
      `INSERT INTO members (name, email, phone, membership_date)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE))
       RETURNING *`,
      [name, email, phone || null, membership_date || null],
    );
    return rows[0];
  }

  async update(id, { name, email, phone, status }) {
    const { rows } = await this.pool.query(
      `UPDATE members
       SET name = $1, email = $2, phone = $3, status = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, email, phone || null, status, id],
    );
    return rows[0] || null;
  }

  async deactivate(id) {
    const { rows: activeLoans } = await this.pool.query(
      `SELECT id FROM loans WHERE member_id = $1 AND status IN ('active', 'overdue')`,
      [id],
    );
    if (activeLoans.length > 0) {
      throw new Error('Cannot deactivate member with active loans');
    }
    const { rows } = await this.pool.query(
      `UPDATE members SET status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id],
    );
    return rows[0] || null;
  }

  async delete(id) {
    const { rows: loanHistory } = await this.pool.query(
      'SELECT id FROM loans WHERE member_id = $1 LIMIT 1',
      [id],
    );
    if (loanHistory.length > 0) {
      throw new Error('Cannot delete member with loan history');
    }
    const { rowCount } = await this.pool.query('DELETE FROM members WHERE id = $1', [id]);
    return rowCount > 0;
  }
}
