class Member {
    constructor(db) {
        this.db = db;
    }

    findAll(includeInactive = false) {
        if (includeInactive) {
            return this.db.prepare('SELECT * FROM members ORDER BY name').all();
        }
        return this.db.prepare('SELECT * FROM members WHERE status = ? ORDER BY name').all('active');
    }

    findById(id) {
        return this.db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    }

    create(member) {
        const stmt = this.db.prepare(`
            INSERT INTO members (name, email, phone, membership_date, status)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            member.name,
            member.email,
            member.phone,
            member.membership_date || new Date().toISOString().split('T')[0],
            member.status || 'active'
        );
        return result.lastInsertRowid;
    }

    update(id, member) {
        const stmt = this.db.prepare(`
            UPDATE members 
            SET name = ?, email = ?, phone = ?, status = ?
            WHERE id = ?
        `);
        return stmt.run(
            member.name,
            member.email,
            member.phone,
            member.status,
            id
        );
    }

    deactivate(id) {
        const hasActiveLoans = this.db.prepare('SELECT COUNT(*) as count FROM loans WHERE member_id = ? AND status = ?')
            .get(id, 'active').count;
        
        if (hasActiveLoans > 0) {
            throw new Error('Cannot deactivate member with active loans');
        }

        return this.db.prepare('UPDATE members SET status = ? WHERE id = ?').run('inactive', id);
    }

    delete(id) {
        const hasLoans = this.db.prepare('SELECT COUNT(*) as count FROM loans WHERE member_id = ?').get(id).count;
        
        if (hasLoans > 0) {
            throw new Error('Cannot delete member with loan history');
        }

        return this.db.prepare('DELETE FROM members WHERE id = ?').run(id);
    }
}

module.exports = Member;
