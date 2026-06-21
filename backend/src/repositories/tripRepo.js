const db = require('../db');
const prisma = db.prisma;

function mapTrip(row, favorites) {
    return {
        id: row.tripId,
        userId: row.userId,
        name: row.tripName,
        countryId: row.countryId,
        country_name_he: row.country ? row.country.countryNameHe : null,
        startMonth: row.startMonth,
        endMonth: row.endMonth,
        travelerType: row.travelStyle,
        budgetLevel: row.budget,
        interests: row.interests || [],
        createdAt: row.createdAt
            ? (row.createdAt instanceof Date
                ? row.createdAt.toISOString().slice(0, 10)
                : String(row.createdAt).slice(0, 10))
            : null,
        favorites: favorites || []
    };
}

async function attachFavorites(trips) {
    if (trips.length === 0) return trips;

    const ids = trips.map(function(t) { return t.tripId; });
    const favRows = await prisma.tripAttraction.findMany({
        where: { tripId: { in: ids } },
        select: { tripId: true, attractionId: true }
    });

    const favMap = {};
    for (const row of favRows) {
        if (!favMap[row.tripId]) favMap[row.tripId] = [];
        favMap[row.tripId].push(row.attractionId);
    }

    return trips.map(function(t) {
        return mapTrip(t, favMap[t.tripId] || []);
    });
}

const tripRepo = {
    async findByUser(userId) {
        const rows = await prisma.trip.findMany({
            where: { userId: parseInt(userId, 10) },
            include: { country: true },
            orderBy: { tripId: 'desc' }
        });
        return attachFavorites(rows);
    },

    async findById(tripId) {
        const row = await prisma.trip.findUnique({
            where: { tripId: parseInt(tripId, 10) },
            include: { country: true }
        });
        if (!row) return null;
        const [withFav] = await attachFavorites([row]);
        return withFav;
    },

    async create({ userId, name, countryId, startMonth, endMonth, travelerType, budgetLevel, interests }) {
        const row = await prisma.trip.create({
            data: {
                userId,
                tripName: name,
                countryId: parseInt(countryId, 10),
                startMonth,
                endMonth,
                travelStyle: travelerType,
                budget: budgetLevel,
                interests: interests || [],
                createdAt: new Date()
            }
        });
        return row.tripId;
    },

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

        const data = {};
        for (const [apiKey, dbCol] of Object.entries(colMap)) {
            if (fields[apiKey] !== undefined) {
                data[dbCol] = apiKey === 'countryId' ? parseInt(fields[apiKey], 10) : fields[apiKey];
            }
        }
        if (Object.keys(data).length === 0) return;

        await prisma.trip.update({ where: { tripId: parseInt(tripId, 10) }, data });
    },

    async delete(tripId) {
        const id = parseInt(tripId, 10);
        await prisma.tripAttraction.deleteMany({ where: { tripId: id } });
        await prisma.trip.delete({ where: { tripId: id } });
    },

    async toggleFavorite(tripId, attractionId) {
        const tId = parseInt(tripId, 10);
        const aId = parseInt(attractionId, 10);

        const existing = await prisma.tripAttraction.findUnique({
            where: { tripId_attractionId: { tripId: tId, attractionId: aId } }
        });

        if (existing) {
            await prisma.tripAttraction.delete({
                where: { tripId_attractionId: { tripId: tId, attractionId: aId } }
            });
        } else {
            await prisma.tripAttraction.create({ data: { tripId: tId, attractionId: aId } });
        }
    }
};

module.exports = tripRepo;
