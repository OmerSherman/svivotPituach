// Upsert helpers used only by the scraper.
// Keeps the scraper independent from the Server ORM (different process, same DB).

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const pool = require('../db');

// Returns existing countryId or inserts and returns new one
async function upsertCountry(nameEn, nameHe) {
    const [rows] = await pool.query(
        'SELECT countryId FROM country WHERE countryNameEn = ?',
        [nameEn]
    );
    if (rows.length > 0) return rows[0].countryId;

    const [result] = await pool.query(
        'INSERT INTO country (countryNameEn, countryNameHe) VALUES (?, ?)',
        [nameEn, nameHe || nameEn]
    );
    return result.insertId;
}

// Returns existing cityId or inserts and returns new one
async function upsertCity(nameEn, nameHe, countryId, latitude, longitude) {
    const [rows] = await pool.query(
        'SELECT cityId FROM city WHERE cityNameEn = ?',
        [nameEn]
    );
    if (rows.length > 0) return rows[0].cityId;

    const [result] = await pool.query(
        'INSERT INTO city (cityNameEn, cityNameHe, countryId) VALUES (?, ?, ?)',
        [nameEn, nameHe || nameEn, countryId]
    );
    return result.insertId;
}

// Inserts attraction if one with the same name+cityId doesn't exist yet
async function upsertAttraction({ cityId, name, nameHE, type, descriptionHe, descriptionEn, image_url, latitude, longitude, tags }) {
    const [rows] = await pool.query(
        'SELECT attractionId FROM attraction WHERE cityId = ? AND name = ?',
        [cityId, name]
    );
    if (rows.length > 0) {
        // update HE fields if we now have them
        await pool.query(
            'UPDATE attraction SET nameHE = ?, descriptionHe = ? WHERE attractionId = ?',
            [nameHE || name, descriptionHe || descriptionEn || '', rows[0].attractionId]
        );
        return rows[0].attractionId;
    }

    const [result] = await pool.query(
        `INSERT INTO attraction
         (cityId, name, nameHE, type, descriptionHe, img_url, popularity_score, tags, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            cityId,
            name,
            nameHE || name,
            type,
            descriptionHe || descriptionEn || '',
            image_url || null,
            0,
            JSON.stringify(tags || []),
            latitude || null,
            longitude || null
        ]
    );
    return result.insertId;
}

async function closePool() {
    await pool.end();
}

module.exports = { upsertCountry, upsertCity, upsertAttraction, closePool };
