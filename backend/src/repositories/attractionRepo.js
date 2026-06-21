const db = require('../db');
const prisma = db.prisma;

function mapAttraction(row) {
    if (!row) return null;
    return {
        id: row.attractionId,
        city_id: row.cityId,
        name: row.name,
        name_he: row.nameHE,
        type: row.type,
        tags: row.tags,
        description_he: row.descriptionHe,
        image_url: row.img_url,
        popularity_score: row.popularity_score,
        audience_scores: row.audience_scores,
        best_months: row.best_months,
        avoid_months: row.avoid_months,
        seasonal_note_he: row.seasonal_note_he,
        latitude: row.latitude,
        longitude: row.longitude
    };
}

const attractionRepo = {
    async findAll({ type, cityId } = {}) {
        const where = {};
        if (type) where.type = type;
        if (cityId) where.cityId = parseInt(cityId, 10);

        const rows = await prisma.attraction.findMany({ where, orderBy: { attractionId: 'asc' } });
        return rows.map(mapAttraction);
    },

    async findById(id) {
        const row = await prisma.attraction.findUnique({ where: { attractionId: parseInt(id, 10) } });
        return mapAttraction(row);
    },

    async findByIds(ids) {
        if (!ids || ids.length === 0) return [];
        const rows = await prisma.attraction.findMany({
            where: { attractionId: { in: ids.map(function(id) { return parseInt(id, 10); }) } }
        });
        return rows.map(mapAttraction);
    },

    async findTop({ minScore = 80, limit = 6 } = {}) {
        const rows = await prisma.attraction.findMany({
            where: { popularity_score: { gte: minScore } },
            orderBy: { popularity_score: 'desc' },
            take: limit
        });
        return rows.map(mapAttraction);
    },

    async findMapPins(cityId) {
        const rows = await prisma.attraction.findMany({
            where: { cityId: parseInt(cityId, 10) },
            select: { attractionId: true, nameHE: true, type: true, latitude: true, longitude: true }
        });
        return rows.map(function(row) {
            return {
                id: row.attractionId,
                name_he: row.nameHE,
                type: row.type,
                latitude: row.latitude,
                longitude: row.longitude
            };
        });
    },

    async create(data) {
        const row = await prisma.attraction.create({
            data: {
                cityId: data.cityId,
                name: data.name,
                nameHE: data.nameHE,
                type: data.type,
                descriptionHe: data.descriptionHe || null,
                tags: data.tags || [],
                img_url: data.img_url || null,
                popularity_score: 0,
                audience_scores: {},
                best_months: data.best_months || [],
                avoid_months: data.avoid_months || [],
                seasonal_note_he: data.seasonal_note_he || null,
                latitude: data.latitude || null,
                longitude: data.longitude || null
            }
        });
        return row.attractionId;
    },

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

        const data = {};
        for (const [apiKey, dbCol] of Object.entries(colMap)) {
            if (fields[apiKey] !== undefined) data[dbCol] = fields[apiKey];
        }
        if (Object.keys(data).length === 0) return;

        await prisma.attraction.update({ where: { attractionId: parseInt(id, 10) }, data });
    },

    async delete(id) {
        await prisma.attraction.delete({ where: { attractionId: parseInt(id, 10) } });
    }
};

module.exports = attractionRepo;
