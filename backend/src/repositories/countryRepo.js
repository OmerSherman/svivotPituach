const db = require('../db');
const prisma = db.prisma;

function mapCountry(row) {
    if (!row) return null;
    return {
        id: row.countryId,
        name: row.countryNameEn,
        name_he: row.countryNameHe,
        summary_he: row.summaryHe || null,
        banner_image_url: row.bannerImageUrl || null,
        latitude: row.latitude,
        longitude: row.longitude
    };
}

const countryRepo = {
    async findById(id) {
        const row = await prisma.country.findUnique({ where: { countryId: parseInt(id, 10) } });
        return mapCountry(row);
    },

    async findAll() {
        const rows = await prisma.country.findMany({ orderBy: { countryId: 'asc' } });
        return rows.map(mapCountry);
    },

    async exists(id) {
        const count = await prisma.country.count({ where: { countryId: parseInt(id, 10) } });
        return count > 0;
    }
};

module.exports = countryRepo;
