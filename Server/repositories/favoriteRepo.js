const db = require('../db');
const prisma = db.prisma;

const favoriteRepo = {
    async findByUser(userId) {
        const rows = await prisma.tripAttraction.findMany({
            where: { trip: { userId: parseInt(userId, 10) } },
            include: { trip: { select: { tripId: true } }, attraction: { select: { attractionId: true, nameHE: true } } }
        });

        return rows.map(function(row) {
            return {
                id: row.tripId + '-' + row.attractionId,
                userId: parseInt(userId, 10),
                tripId: row.tripId,
                itemId: row.attractionId,
                itemType: 'attraction',
                itemName: row.attraction.nameHE
            };
        });
    },

    async add(tripId, attractionId) {
        const tId = parseInt(tripId, 10);
        const aId = parseInt(attractionId, 10);

        const existing = await prisma.tripAttraction.findUnique({
            where: { tripId_attractionId: { tripId: tId, attractionId: aId } }
        });
        if (existing) return false;

        await prisma.tripAttraction.create({ data: { tripId: tId, attractionId: aId } });
        return true;
    },

    async remove(tripId, attractionId) {
        const tId = parseInt(tripId, 10);
        const aId = parseInt(attractionId, 10);

        try {
            await prisma.tripAttraction.delete({
                where: { tripId_attractionId: { tripId: tId, attractionId: aId } }
            });
            return true;
        } catch (err) {
            return false;
        }
    }
};

module.exports = favoriteRepo;
