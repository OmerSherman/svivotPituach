const pool = require('../db');

function rowToMessage(row) {
    return {
        id: row.messageId,
        room: row.room,
        userId: row.userId,
        userName: row.userName,
        text: row.text,
        createdAt: row.createdAt
    };
}

var MessageORM = {
    create: async function(data) {
        const [result] = await pool.query(
            'INSERT INTO message (room, userId, userName, text) VALUES (?, ?, ?, ?)',
            [data.room, parseInt(data.userId) || 0, data.userName, data.text.trim()]
        );

        const [rows] = await pool.query(
            'SELECT messageId, room, userId, userName, text, createdAt FROM message WHERE messageId = ?',
            [result.insertId]
        );

        return rowToMessage(rows[0]);
    },

    findByRoom: async function(room, limit) {
        const [rows] = await pool.query(
            `SELECT messageId, room, userId, userName, text, createdAt
             FROM message
             WHERE room = ?
             ORDER BY createdAt ASC
             LIMIT ?`,
            [room, limit || 50]
        );

        return rows.map(rowToMessage);
    }
};

module.exports = MessageORM;
