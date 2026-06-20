const db = require('../db');
const prisma = db.prisma;

const DEFAULTS = { theme: 'light', fontSize: 'medium', density: 'normal' };

const settingsRepo = {
    async findByUser(userId) {
        const row = await prisma.settings.findUnique({ where: { userId: parseInt(userId, 10) } });
        return row ? Object.assign({}, DEFAULTS, row) : Object.assign({}, DEFAULTS);
    },

    async upsert(userId, { theme, fontSize, density }) {
        const uid = parseInt(userId, 10);
        const updateData = {};
        if (theme !== undefined) updateData.theme = theme;
        if (fontSize !== undefined) updateData.fontSize = fontSize;
        if (density !== undefined) updateData.density = density;

        await prisma.settings.upsert({
            where: { userId: uid },
            create: {
                userId: uid,
                theme: theme || DEFAULTS.theme,
                fontSize: fontSize || DEFAULTS.fontSize,
                density: density || DEFAULTS.density
            },
            update: updateData
        });
    }
};

module.exports = settingsRepo;
