/**
 * Apply SQL migrations without re-importing dump.
 * Run: node Server/scripts/apply-migrations.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { prisma } = require('../db');

async function run() {
    const file = path.join(__dirname, '../migrations/002_city_media.sql');
    const sql = fs.readFileSync(file, 'utf8');
    const statements = sql
        .split(';')
        .map(function(s) {
            return s.replace(/--[^\n]*/g, '').trim();
        })
        .filter(Boolean);

    for (const stmt of statements) {
        try {
            await prisma.$executeRawUnsafe(stmt);
            console.log('OK:', stmt.slice(0, 70).replace(/\s+/g, ' ') + '...');
        } catch (err) {
            if (err.code === 'P2010' && String(err.message).includes('1060')) {
                console.log('SKIP (column exists):', stmt.slice(0, 50));
            } else if (String(err.message).includes('Duplicate column')) {
                console.log('SKIP (column exists):', stmt.slice(0, 50));
            } else {
                console.error('FAIL:', stmt.slice(0, 80));
                throw err;
            }
        }
    }

    const cities = await prisma.city.findMany({
        take: 4,
        select: { cityId: true, cityNameHe: true, bannerImageUrl: true }
    });
    console.log('\nCities sample:', cities);

    const imgStats = await prisma.$queryRaw`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN img_url IS NOT NULL AND img_url != '' THEN 1 ELSE 0 END) AS with_img
        FROM attraction
    `;
    console.log('Attractions images:', imgStats[0]);

    await prisma.$disconnect();
}

run().catch(async function(err) {
    console.error(err.message);
    await prisma.$disconnect();
    process.exit(1);
});
