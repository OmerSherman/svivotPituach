const pool = require('../db');

// favorites are stored as trip_attraction rows.
// each row links a trip (owned by a user) to an attraction.

class FavoriteORM {
    async findByUser(userId) {
        const [rows] = await pool.query(
            `SELECT ta.tripId, ta.attractionId AS itemId
             FROM trip_attraction ta
             JOIN trip t ON t.tripId = ta.tripId
             WHERE t.userId = ?`,
            [userId]
        );
        return rows;
    }

    async add(tripId, attractionId) {
        const [existing] = await pool.query(
            'SELECT 1 FROM trip_attraction WHERE tripId = ? AND attractionId = ?',
            [tripId, attractionId]
        );
        if (existing.length > 0) return false; // already exists

        await pool.query(
            'INSERT INTO trip_attraction (tripId, attractionId) VALUES (?, ?)',
            [tripId, attractionId]
        );
        return true;
    }

    async remove(tripId, attractionId) {
        const [result] = await pool.query(
            'DELETE FROM trip_attraction WHERE tripId = ? AND attractionId = ?',
            [tripId, attractionId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = new FavoriteORM();
