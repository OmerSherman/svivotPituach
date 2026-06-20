const pool = require('../db');

const SELECT = `
    SELECT
        attractionId    AS id,
        cityId          AS city_id,
        name,
        nameHE          AS name_he,
        type,
        tags,
        descriptionHe   AS description_he,
        img_url         AS image_url,
        popularity_score,
        audience_scores,
        best_months,
        avoid_months,
        seasonal_note_he,
        latitude,
        longitude
    FROM attraction
`;

class AttractionORM {
    async findAll({ type, cityId } = {}) {
        const conditions = [];
        const values = [];

        if (type) {
            conditions.push('type = ?');
            values.push(type);
        }
        if (cityId) {
            conditions.push('cityId = ?');
            values.push(cityId);
        }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
        const [rows] = await pool.query(SELECT + where, values);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query(SELECT + 'WHERE attractionId = ?', [id]);
        return rows[0] || null;
    }

    async findMapPins(cityId) {
        const [rows] = await pool.query(
            `SELECT attractionId AS id, nameHE AS name_he, type, latitude, longitude
             FROM attraction WHERE cityId = ?`,
            [cityId]
        );
        return rows;
    }

    async create({ cityId, name, nameHE, type, descriptionHe, tags, img_url, popularity_score, audience_scores, best_months, avoid_months, seasonal_note_he, latitude, longitude }) {
        const [result] = await pool.query(
            `INSERT INTO attraction
             (cityId, name, nameHE, type, descriptionHe, tags, img_url, popularity_score, audience_scores, best_months, avoid_months, seasonal_note_he, latitude, longitude)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cityId, name, nameHE, type, descriptionHe,
                JSON.stringify(tags || []),
                img_url || null,
                popularity_score || 0,
                JSON.stringify(audience_scores || {}),
                JSON.stringify(best_months || []),
                JSON.stringify(avoid_months || []),
                seasonal_note_he || null,
                latitude || null,
                longitude || null
            ]
        );
        return result.insertId;
    }

    async update(id, fields) {
        const colMap = {
            name: 'name',
            name_he: 'nameHE',
            type: 'type',
            description_he: 'descriptionHe',
            tags: 'tags',
            image_url: 'img_url',
            popularity_score: 'popularity_score',
            audience_scores: 'audience_scores',
            best_months: 'best_months',
            avoid_months: 'avoid_months',
            seasonal_note_he: 'seasonal_note_he',
            latitude: 'latitude',
            longitude: 'longitude'
        };

        const updates = [];
        const values = [];

        for (const [apiKey, dbCol] of Object.entries(colMap)) {
            if (fields[apiKey] !== undefined) {
                updates.push(`${dbCol} = ?`);
                const val = fields[apiKey];
                values.push(typeof val === 'object' ? JSON.stringify(val) : val);
            }
        }

        if (updates.length === 0) return;
        values.push(id);

        await pool.query(`UPDATE attraction SET ${updates.join(', ')} WHERE attractionId = ?`, values);
    }

    async delete(id) {
        await pool.query('DELETE FROM attraction WHERE attractionId = ?', [id]);
    }
}

module.exports = new AttractionORM();
