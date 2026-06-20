const db = require('../db');
const prisma = db.prisma;

function mapUser(row) {
    if (!row) return null;
    return {
        userId: row.userId,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        password: row.password,
        userRole: row.userRole,
        createDate: row.createDate,
        updateDate: row.updateDate
    };
}

const userRepo = {
    async findAll() {
        const rows = await prisma.user.findMany({ orderBy: { userId: 'asc' } });
        return rows.map(mapUser);
    },

    async findById(id) {
        const row = await prisma.user.findUnique({ where: { userId: parseInt(id, 10) } });
        return mapUser(row);
    },

    async findByEmail(email) {
        const row = await prisma.user.findUnique({ where: { email } });
        return mapUser(row);
    },

    async findByEmailAndPassword(email, password) {
        const row = await prisma.user.findFirst({ where: { email, password } });
        return mapUser(row);
    },

    async create({ firstName, lastName, email, password, userRole }) {
        const now = new Date().toISOString().slice(0, 10);
        const row = await prisma.user.create({
            data: { firstName, lastName, email, password, userRole, createDate: now, updateDate: now }
        });
        return row.userId;
    },

    async update(id, fields) {
        const allowed = ['firstName', 'lastName', 'email', 'password', 'userRole'];
        const data = {};
        for (const key of allowed) {
            if (fields[key] !== undefined) data[key] = fields[key];
        }
        if (Object.keys(data).length === 0) return;
        data.updateDate = new Date().toISOString().slice(0, 10);
        await prisma.user.update({ where: { userId: parseInt(id, 10) }, data });
    },

    async delete(id) {
        await prisma.user.delete({ where: { userId: parseInt(id, 10) } });
    }
};

module.exports = userRepo;
