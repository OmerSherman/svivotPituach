const pool = require('../db');

class UserORM {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM user');
        console.log("users from ORM")
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM user WHERE userId = ?', [id]);
        return rows[0] || null;
    }

    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
        return rows[0] || null;
    }

    async findByEmailAndPassword(email, password) {
        const [rows] = await pool.query(
            'SELECT * FROM user WHERE email = ? AND password = ?',
            [email, password]
        );
        return rows[0] || null;
    }

    async create({ firstName, lastName, email, password, userRole }) {
        const now = new Date().toISOString().slice(0, 10);
        const [result] = await pool.query(
            'INSERT INTO user (firstName, lastName, email, password, userRole, createDate, updateDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, password, userRole, now, now]
        );
        return result.insertId;
    }

    async update(id, fields) {
        const allowed = ['firstName', 'lastName', 'email', 'password', 'userRole'];
        const updates = [];
        const values = [];

        for (const key of allowed) {
            if (fields[key] !== undefined) {
                updates.push(`${key} = ?`);
                values.push(fields[key]);
            }
        }

        if (updates.length === 0) return;

        updates.push('updateDate = ?');
        values.push(new Date().toISOString().slice(0, 10));
        values.push(id);

        await pool.query(`UPDATE user SET ${updates.join(', ')} WHERE userId = ?`, values);
    }

    async delete(id) {
        await pool.query('DELETE FROM user WHERE userId = ?', [id]);
    }
}

module.exports = new UserORM();
