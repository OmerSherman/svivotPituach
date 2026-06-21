const db = require('../db');
const prisma = db.prisma;

function mapCity(row) {
    if (!row) return null;
    return {
        id: row.cityId,
        name: row.cityNameEn,
        name_he: row.cityNameHe,
        country_id: row.countryId,
        summary_he: row.summaryHe || null,
        banner_image_url: row.bannerImageUrl || null,
        latitude: row.latitude,
        longitude: row.longitude
    };
}

const cityRepo = {
    async findAll() {
        const rows = await prisma.city.findMany({ orderBy: { cityId: 'asc' } });
        return rows.map(mapCity);
    },

    async findById(id) {
        const row = await prisma.city.findUnique({ where: { cityId: parseInt(id, 10) } });
        return mapCity(row);
    },

    async search(q) {
        const rows = await prisma.city.findMany({
            where: {
                OR: [
                    { cityNameEn: { contains: q } },
                    { cityNameHe: { contains: q } }
                ]
            },
            orderBy: { cityId: 'asc' }
        });
        return rows.map(mapCity);
    }
};

module.exports = cityRepo;
