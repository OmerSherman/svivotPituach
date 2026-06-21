const db = require('../db');
const prisma = db.prisma;

function mapMessage(row) {
    return {
        id: row.messageId,
        room: row.room,
        userId: row.userId,
        userName: row.userName,
        text: row.text,
        createdAt: row.createdAt
    };
}

const messageRepo = {
    async create(data) {
        const row = await prisma.message.create({
            data: {
                room: data.room,
                userId: parseInt(data.userId, 10) || 0,
                userName: data.userName,
                text: data.text.trim()
            }
        });
        return mapMessage(row);
    },

    async findByRoom(room, limit) {
        const rows = await prisma.message.findMany({
            where: { room },
            orderBy: { createdAt: 'asc' },
            take: limit || 50
        });
        return rows.map(mapMessage);
    }
};

module.exports = messageRepo;
