const db = require('../db');
const prisma = db.prisma;

const countryRepo = {
    async findById(id) {
        return prisma.country.findUnique({ where: { countryId: parseInt(id, 10) } });
    },

    async findAll() {
        return prisma.country.findMany({ orderBy: { countryId: 'asc' } });
    }
};

module.exports = countryRepo;
