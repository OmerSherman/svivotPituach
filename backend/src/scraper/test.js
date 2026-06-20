require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { fetchWikitext, fetchCoordinates } = require('./wikivoyageClient');
const { extractAttractions, extractDistrictLinks } = require('./parser');
const { upsertCountry, upsertCity, upsertAttraction, closePool } = require('./db');

const TEST_COUNTRY_EN = 'Argentina';
const TEST_COUNTRY_HE = 'ארגנטינה';

const CITIES = [
    "בואנוס איירס",
    "קורדובה (ארגנטינה)",
    "סלטה (ארגנטינה)"
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function scrapeCity(cityHe, countryId) {
    console.log(`\n--- ${cityHe} ---`);

    const heText = await fetchWikitext('he', cityHe);
    if (!heText) { console.log('  HE page not found, skipping'); return; }

    let attractions = extractAttractions(heText);

    // If no attractions on main page, try district sub-pages
    if (attractions.length === 0) {
        const districts = extractDistrictLinks(cityHe, heText);
        console.log(`  No attractions on main page. Checking ${districts.length} district(s)...`);
        for (const district of districts) {
            await sleep(300);
            const distText = await fetchWikitext('he', district);
            if (!distText) continue;
            const found = extractAttractions(distText);
            console.log(`    ${district}: ${found.length} attractions`);
            attractions.push(...found);
            if (attractions.length >= 10) break;
        }
    }

    if (attractions.length === 0) { console.log('  No attractions found, skipping'); return; }

    console.log(`  Found ${attractions.length} attractions. Saving first 10:`);

    const coords = await fetchCoordinates('he', cityHe);
    await sleep(300);

    const cityId = await upsertCity(cityHe, cityHe, countryId, coords?.latitude, coords?.longitude);
    console.log(`  city id: ${cityId}`);

    for (const a of attractions.slice(0, 10)) {
        const id = await upsertAttraction({
            cityId,
            name:          a.name,
            nameHE:        a.name,
            type:          a.type,
            descriptionHe: a.description_he,
            descriptionEn: '',
            image_url:     a.image_url,
            latitude:      a.latitude,
            longitude:     a.longitude,
            tags:          a.tags
        });
        console.log(`  saved: "${a.name}" (id: ${id})`);
    }
}

async function test() {
    const countryId = await upsertCountry(TEST_COUNTRY_EN, TEST_COUNTRY_HE);
    console.log(`country id: ${countryId}`);

    for (const city of CITIES) {
        await scrapeCity(city, countryId);
        await sleep(500);
    }

    console.log('\nDone!');
    await closePool();
}

test().catch(console.error);
