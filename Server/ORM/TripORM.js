const pool = require('../db');

const SELECT = `
    SELECT
        tripId      AS id,
        userId,
        tripName    AS name,
        countryId,
        startMonth,
        endMonth,
        travelStyle AS travelerType,
        budget      AS budgetLevel,
        interests,
        createdAt
    FROM trip
`;

class TripORM {
    async _attachFavorites(trips) {
        if (trips.length === 0) return trips;

        const ids = trips.map(t => t.id);
        const [favRows] = await pool.query(
            'SELECT tripId, attractionId FROM trip_attraction WHERE tripId IN (?)',
            [ids]
        );

        const favMap = {};
        for (const row of favRows) {
            if (!favMap[row.tripId]) favMap[row.tripId] = [];
            favMap[row.tripId].push(row.attractionId);
        }

        return trips.map(t => Object.assign({}, t, { favorites: favMap[t.id] || [] }));
    }

    async findByUser(userId) {
        const [rows] = await pool.query(SELECT + 'WHERE userId = ?', [userId]);
        return this._attachFavorites(rows);
    }

    async findById(tripId) {
        const [rows] = await pool.query(SELECT + 'WHERE tripId = ?', [tripId]);
        if (!rows[0]) return null;
        const [withFav] = await this._attachFavorites([rows[0]]);
        return withFav;
    }

    async create({ userId, name, countryId, startMonth, endMonth, travelerType, budgetLevel, interests }) {
        const now = new Date().toISOString().slice(0, 10);
        const [result] = await pool.query(
            `INSERT INTO trip (userId, tripName, countryId, startMonth, endMonth, travelStyle, budget, interests, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, name, countryId, startMonth, endMonth, travelerType, budgetLevel, JSON.stringify(interests || []), now]
        );
        return result.insertId;
    }

    async update(tripId, fields) {
        const colMap = {
            name: 'tripName',
            countryId: 'countryId',
            startMonth: 'startMonth',
            endMonth: 'endMonth',
            travelerType: 'travelStyle',
            budgetLevel: 'budget',
            interests: 'interests'
        };

        const updates = [];
        const values = [];

        for (const [apiKey, dbCol] of Object.entries(colMap)) {
            if (fields[apiKey] !== undefined) {
                updates.push(`${dbCol} = ?`);
                const val = fields[apiKey];
                values.push(Array.isArray(val) ? JSON.stringify(val) : val);
            }
        }

        if (updates.length === 0) return;
        values.push(tripId);

        await pool.query(`UPDATE trip SET ${updates.join(', ')} WHERE tripId = ?`, values);
    }

    async delete(tripId) {
        await pool.query('DELETE FROM trip_attraction WHERE tripId = ?', [tripId]);
        await pool.query('DELETE FROM trip WHERE tripId = ?', [tripId]);
    }

    async toggleFavorite(tripId, attractionId) {
        const [rows] = await pool.query(
            'SELECT 1 FROM trip_attraction WHERE tripId = ? AND attractionId = ?',
            [tripId, attractionId]
        );

        if (rows.length > 0) {
            await pool.query(
                'DELETE FROM trip_attraction WHERE tripId = ? AND attractionId = ?',
                [tripId, attractionId]
            );
        } else {
            await pool.query(
                'INSERT INTO trip_attraction (tripId, attractionId) VALUES (?, ?)',
                [tripId, attractionId]
            );
        }
    }
}

module.exports = new TripORM();
