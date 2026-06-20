/**
 * Enrich DB: full details + image URL for every country, city, attraction.
 * Run after import: node Server/scripts/enrich-database.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { prisma } = require('../db');

const mockCities = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../models/mock_data/cities.json'), 'utf8')
);
const mockAttractions = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../models/mock_data/attractions.json'), 'utf8')
);

const EXTRA_CITIES = {
    5: {
        name: 'Cali',
        name_he: 'קאלי',
        country_id: 4,
        summary_he: 'עיר הסלסa והקפה בדרום קולומביה. לילות תוססים, מוזיקה חיה ושוקי אמנות.',
        banner_image_url: 'https://loremflickr.com/800/600/cali,colombia/all'
    },
    6: {
        name: 'Bogotá',
        name_he: 'בוגוטה',
        country_id: 4,
        summary_he: 'בירת קולומביה בגובה 2,640 מטר — מוזיאונים, Ciclovía וקולינריה מגוונת.',
        banner_image_url: 'https://loremflickr.com/800/600/bogota,colombia/all'
    },
    7: {
        name: 'Buenos Aires',
        name_he: 'בואנוס איירס (מרכז)',
        country_id: 2,
        summary_he: 'אטרקציות מרכז העיר: אובליסק, Casa Rosada, שכונות היסטוריות ואדריכלות קלאסית.',
        banner_image_url: 'https://loremflickr.com/800/600/obelisco,buenosaires/all'
    },
    8: {
        name: 'Córdoba',
        name_he: 'קורדובה (ארגנטינה)',
        country_id: 2,
        summary_he: 'עיר אוניברסיטאית עם מוזיאונים, מרכז היסטורי ומלונות לתרמילאים.',
        banner_image_url: 'https://loremflickr.com/800/600/cordoba,argentina/all'
    }
};

const COUNTRIES = [
    {
        id: 1,
        summary_he: 'מדינה של האנדים, יערות גשם, חופים ומורשת אינקאית. בית למאצ\'ו פיצ\'ו, קוסקו ולימה.',
        banner_image_url: 'https://loremflickr.com/800/600/machupicchu,peru/all'
    },
    {
        id: 2,
        summary_he: 'טנגו, סטייקים, יין מנדoza ואדריכלות אירופאית. בואנוס איירס — "פריז של דרום אמריקה".',
        banner_image_url: 'https://loremflickr.com/800/600/buenosaires,argentina/all'
    },
    {
        id: 3,
        summary_he: 'קרנבל, חופים, פסל הישו ויער האמזונס. ברזיל — היעד הגדול ביותר בדרום אמריקה.',
        banner_image_url: 'https://loremflickr.com/800/600/riodejaneiro,brazil/all'
    },
    {
        id: 4,
        summary_he: 'קפה, סלסה, הקריביים ורכסי האנדים. קולומביה — מגוון נופים ותרבות עשירה.',
        banner_image_url: 'https://loremflickr.com/800/600/bogota,colombia/all'
    }
];
const DEFAULT_AUDIENCE = { solo: 80, couple: 82, family: 75, group: 78 };

async function syncCountries() {
    for (const c of COUNTRIES) {
        await prisma.country.update({
            where: { countryId: c.id },
            data: { summaryHe: c.summary_he, bannerImageUrl: c.banner_image_url }
        });
    }
    console.log('Countries updated:', COUNTRIES.length);
}

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function slugify(text) {
    return String(text || 'travel')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 40) || 'southamerica';
}

function imageUrlFor(name, cityNameEn) {
    const slug = slugify(name) + ',' + slugify(cityNameEn || 'city');
    return 'https://loremflickr.com/800/600/' + slug + '/all';
}

function inferTags(type, existing) {
    if (existing && Array.isArray(existing) && existing.length > 0) return existing;
    if (type === 'tour') return ['תרבות', 'סיור'];
    if (type === 'route') return ['הליכה', 'נוף'];
    return ['תרבות', 'אטרקציה'];
}

async function syncCities() {
    const all = mockCities.concat(
        Object.keys(EXTRA_CITIES).map(function(id) {
            return Object.assign({ id: parseInt(id, 10) }, EXTRA_CITIES[id]);
        })
    );

    for (const c of all) {
        await prisma.city.update({
            where: { cityId: c.id },
            data: {
                cityNameEn: c.name,
                cityNameHe: c.name_he,
                summaryHe: c.summary_he,
                bannerImageUrl: c.banner_image_url
            }
        });
    }
    console.log('Cities updated:', all.length);
}

async function syncAttractionsFromMock() {
    for (const a of mockAttractions) {
        await prisma.attraction.update({
            where: { attractionId: a.id },
            data: {
                cityId: a.city_id,
                name: a.name,
                nameHE: a.name_he,
                type: a.type,
                descriptionHe: a.description_he,
                tags: a.tags,
                img_url: a.image_url,
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
    console.log('Attractions synced from mock:', mockAttractions.length);
}

async function enrichRemainingAttractions() {
    const rows = await prisma.attraction.findMany({
        include: { city: true }
    });

    let enriched = 0;
    for (const a of rows) {
        const data = {};
        const cityName = a.city ? a.city.cityNameEn : 'city';

        if (!a.img_url || a.img_url.trim() === '') {
            data.img_url = imageUrlFor(a.name, cityName);
        }

        if (!a.descriptionHe || a.descriptionHe.trim().length < 8) {
            const heName = a.nameHE || a.name;
            data.descriptionHe = 'אטרקציה מומלצת: ' + heName + ' ב' + (a.city ? a.city.cityNameHe : 'דרום אמריקה') + '.';
        }

        if (!a.nameHE || a.nameHE.trim() === '') {
            data.nameHE = a.name;
        }

        const tags = a.tags;
        if (!tags || (Array.isArray(tags) && tags.length === 0)) {
            data.tags = inferTags(a.type, tags);
        }

        if (!a.audience_scores || Object.keys(a.audience_scores).length === 0) {
            data.audience_scores = DEFAULT_AUDIENCE;
        }

        if (!a.best_months || (Array.isArray(a.best_months) && a.best_months.length === 0)) {
            data.best_months = ALL_MONTHS;
        }

        if (!a.avoid_months) {
            data.avoid_months = [];
        }

        if (!a.popularity_score || a.popularity_score === 0) {
            data.popularity_score = 72;
        }

        if (Object.keys(data).length > 0) {
            await prisma.attraction.update({
                where: { attractionId: a.attractionId },
                data: data
            });
            enriched++;
        }
    }
    console.log('Scraped attractions enriched:', enriched);
}

async function verify() {
    const missingCityImg = await prisma.city.count({
        where: { OR: [{ bannerImageUrl: null }, { bannerImageUrl: '' }] }
    });
    const missingCitySummary = await prisma.city.count({
        where: { OR: [{ summaryHe: null }, { summaryHe: '' }] }
    });
    const missingAttrImg = await prisma.attraction.count({
        where: { OR: [{ img_url: null }, { img_url: '' }] }
    });
    const missingAttrDesc = await prisma.attraction.count({
        where: { OR: [{ descriptionHe: null }, { descriptionHe: '' }] }
    });
    const missingCountryImg = await prisma.country.count({
        where: { OR: [{ bannerImageUrl: null }, { bannerImageUrl: '' }] }
    });

    const totals = {
        countries: await prisma.country.count(),
        cities: await prisma.city.count(),
        attractions: await prisma.attraction.count(),
        users: await prisma.user.count()
    };

    console.log('\n=== DB verification ===');
    console.log('Totals:', totals);
    console.log('Missing city images:', missingCityImg);
    console.log('Missing city summaries:', missingCitySummary);
    console.log('Missing attraction images:', missingAttrImg);
    console.log('Missing attraction descriptions:', missingAttrDesc);
    console.log('Missing country images:', missingCountryImg);

    const sample = await prisma.city.findFirst({
        select: { cityNameHe: true, bannerImageUrl: true, summaryHe: true }
    });
    console.log('\nSample city:', {
        name: sample && sample.cityNameHe,
        hasImage: !!(sample && sample.bannerImageUrl),
        hasSummary: !!(sample && sample.summaryHe)
    });

    if (missingCityImg + missingAttrImg + missingCountryImg > 0) {
        throw new Error('DB still has missing image URLs');
    }
}

async function run() {
    console.log('Enriching database...\n');
    await syncCountries();
    await syncCities();
    await syncAttractionsFromMock();
    await enrichRemainingAttractions();
    await verify();
    await prisma.$disconnect();
    console.log('\nDatabase enrichment complete.');
}

if (require.main === module) {
    run().catch(async function(err) {
        console.error(err);
        await prisma.$disconnect();
        process.exit(1);
    });
}

module.exports = { run };
