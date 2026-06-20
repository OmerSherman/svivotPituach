/**
 * Reset DB and fill with clean Hebrew seed data.
 *
 * ONE command:  cd Server && npm run db:setup
 *
 * Data lives in Server/seed/*.json — edit those files to change content.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { prisma } = require('../db');

const SEED = path.join(__dirname, '../seed');
const SERVER = path.join(__dirname, '..');

function load(name) {
    return JSON.parse(fs.readFileSync(path.join(SEED, name), 'utf8'));
}

function cityImage(id) {
    return 'https://picsum.photos/seed/shvil-city-' + id + '/800/600';
}

function countryImage(id) {
    return 'https://picsum.photos/seed/shvil-country-' + id + '/800/600';
}

function attractionImage(id) {
    return 'https://picsum.photos/seed/shvil-attr-' + id + '/800/600';
}

async function seedCountries() {
    const rows = load('countries.json');
    for (const c of rows) {
        await prisma.country.create({
            data: {
                countryId: c.id,
                countryNameEn: c.name_en,
                countryNameHe: c.name_he,
                summaryHe: c.summary_he,
                bannerImageUrl: countryImage(c.id)
            }
        });
    }
    console.log('  countries:', rows.length);
}

async function seedCities() {
    const rows = load('cities.json');
    for (const c of rows) {
        await prisma.city.create({
            data: {
                cityId: c.id,
                cityNameEn: c.name_en,
                cityNameHe: c.name_he,
                countryId: c.country_id,
                summaryHe: c.summary_he,
                bannerImageUrl: cityImage(c.id)
            }
        });
    }
    console.log('  cities:', rows.length);
}

async function seedUsers() {
    const rows = load('users.json');
    for (const u of rows) {
        await prisma.user.create({
            data: {
                userId: u.userId,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                password: u.password,
                userRole: u.userRole,
                createDate: u.createDate,
                updateDate: u.updateDate
            }
        });
    }
    console.log('  users:', rows.length);
}

async function seedSettings() {
    const rows = load('settings.json');
    for (const s of rows) {
        await prisma.settings.create({ data: s });
    }
    console.log('  settings:', rows.length);
}

async function seedAttractions() {
    const rows = load('attractions.json');
    for (const a of rows) {
        await prisma.attraction.create({
            data: {
                attractionId: a.id,
                cityId: a.city_id,
                name: a.name,
                nameHE: a.name_he,
                type: a.type,
                descriptionHe: a.description_he,
                tags: a.tags,
                img_url: attractionImage(a.id),
                popularity_score: a.popularity_score,
                audience_scores: a.audience_scores,
                best_months: a.best_months,
                avoid_months: a.avoid_months || [],
                seasonal_note_he: a.seasonal_note_he || null,
                latitude: a.latitude,
                longitude: a.longitude
            }
        });
    }
    console.log('  attractions:', rows.length);
}

async function verify() {
    const counts = {
        countries: await prisma.country.count(),
        cities: await prisma.city.count(),
        attractions: await prisma.attraction.count(),
        users: await prisma.user.count()
    };
    const sample = await prisma.city.findFirst({ where: { cityId: 1 } });
    console.log('\n=== סיכום ===');
    console.log('  טבלאות:', counts);
    console.log('  דוגמה — לימה:', sample.cityNameHe, '| תמונה:', sample.bannerImageUrl ? 'כן' : 'לא');
}

async function run() {
    if (!process.env.DATABASE_URL) {
        console.error('חסר DATABASE_URL ב-Server/.env');
        process.exit(1);
    }

    console.log('1/2 — יוצר מחדש את מבנה הטבלאות (Prisma)...');
    execSync('npx prisma db push --force-reset --accept-data-loss', {
        cwd: SERVER,
        stdio: 'inherit'
    });

    console.log('\n2/2 — ממלא נתונים מ-Server/seed/...');
    await seedCountries();
    await seedCities();
    await seedUsers();
    await seedSettings();
    await seedAttractions();
    await verify();
    await prisma.$disconnect();
    console.log('\nהסתיים. הריצי: npm start');
}

if (require.main === module) {
    run().catch(async function(err) {
        console.error(err);
        await prisma.$disconnect();
        process.exit(1);
    });
}

module.exports = { run };
