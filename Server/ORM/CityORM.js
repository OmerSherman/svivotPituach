const pool = require('../db');

const SELECT = `
    SELECT cityId AS id, cityNameEn AS name, cityNameHe AS name_he, countryId AS country_id
    FROM city
`;

class CityORM {
    async findAll() {
        const [rows] = await pool.query(SELECT);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query(SELECT + 'WHERE cityId = ?', [id]);
        return rows[0] || null;
    }

    async search(q) {
        const like = `%${q}%`;
        const [rows] = await pool.query(
            SELECT + 'WHERE cityNameEn LIKE ? OR cityNameHe LIKE ?',
            [like, like]
        );
        return rows;
    }
}

module.exports = new CityORM();
