const pool = require('../db');

const DEFAULTS = { theme: 'light', fontSize: 'medium', density: 'normal' };

class SettingsORM {
    async findByUser(userId) {
        const [rows] = await pool.query(
            'SELECT theme, fontSize, density FROM settings WHERE userId = ?',
            [userId]
        );
        return rows[0] ? Object.assign({}, DEFAULTS, rows[0]) : Object.assign({}, DEFAULTS);
    }

    async upsert(userId, { theme, fontSize, density }) {
        await pool.query(
            `INSERT INTO settings (userId, theme, fontSize, density)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                 theme    = COALESCE(VALUES(theme),    theme),
                 fontSize = COALESCE(VALUES(fontSize), fontSize),
                 density  = COALESCE(VALUES(density),  density)`,
            [userId, theme || null, fontSize || null, density || null]
        );
    }
}

module.exports = new SettingsORM();
