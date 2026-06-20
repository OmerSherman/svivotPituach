require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { fetchWikitext, fetchCoordinates } = require('./wikivoyageClient');
const { extractAttractions, extractHeDescriptions, extractCityLinks, extractCountryLinks, stripMarkup } = require('./parser');
const { upsertCountry, upsertCity, upsertAttraction, closePool } = require('./db');

// South America countries as listed on Wikivoyage
const SOUTH_AMERICA_COUNTRIES = [
    { en: 'Argentina',  he: 'ארגנטינה' },
    { en: 'Bolivia',    he: 'בוליביה' },
    { en: 'Brazil',     he: 'ברזיל' },
    { en: 'Chile',      he: 'צ\'ילה' },
    { en: 'Colombia',   he: 'קולומביה' },
    { en: 'Ecuador',    he: 'אקוודור' },
    { en: 'Guyana',     he: 'גיאנה' },
    { en: 'Paraguay',   he: 'פרגוואי' },
    { en: 'Peru',       he: 'פרו' },
    { en: 'Suriname',   he: 'סורינאם' },
    { en: 'Uruguay',    he: 'אורוגוואי' },
    { en: 'Venezuela',  he: 'ונצואלה' }
];

// ms delay between API calls to be polite to Wikivoyage servers
const DELAY_MS = 500;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function scrapeCity(cityNameEn, countryId) {
    console.log(`    Scraping city: ${cityNameEn}`);

    // fetch English wikitext
    const enText = await fetchWikitext('en', cityNameEn);
    if (!enText) {
        console.log(`      Skipped (no EN page)`);
        return;
    }
    await sleep(DELAY_MS);

    // get city coordinates
    const coords = await fetchCoordinates('en', cityNameEn);
    await sleep(DELAY_MS);

    // extract EN attractions
    const enAttractions = extractAttractions(enText);
    if (enAttractions.length === 0) {
        console.log(`      Skipped (no attractions found)`);
        return;
    }

    // try to find Hebrew city name and descriptions from HE Wikivoyage
    // first try searching for the city by its EN name in HE wiki
    const heText = await fetchWikitext('he', cityNameEn).catch(() => null);
    await sleep(DELAY_MS);

    const heDescriptions = heText ? extractHeDescriptions(heText) : {};

    // find Hebrew city name from HE page title or leave as EN
    let cityNameHe = cityNameEn;
    if (heText) {
        // HE page exists — use the EN name as fallback, HE name comes from page title
        // (we can't easily get the HE title from wikitext itself, so we try searching)
        const heSearchRes = await fetchHeCityName(cityNameEn);
        if (heSearchRes) cityNameHe = heSearchRes;
        await sleep(DELAY_MS);
    }

    // upsert city
    const cityId = await upsertCity(
        cityNameEn,
        cityNameHe,
        countryId,
        coords ? coords.latitude  : null,
        coords ? coords.longitude : null
    );

    let insertedCount = 0;

    for (const attraction of enAttractions) {
        if (!attraction.name) continue;

        const heDesc = heDescriptions[attraction.name] || '';

        await upsertAttraction({
            cityId,
            name:          attraction.name,
            nameHE:        attraction.name, // no HE name available from template
            type:          attraction.type,
            descriptionHe: heDesc,
            descriptionEn: attraction.description_en,
            image_url:     attraction.image_url,
            latitude:      attraction.latitude,
            longitude:     attraction.longitude,
            tags:          attraction.tags
        });

        insertedCount++;
    }

    console.log(`      Saved city "${cityNameEn}" with ${insertedCount} attractions`);
}

// Search HE Wikivoyage for the Hebrew name of a city
async function fetchHeCityName(cityNameEn) {
    try {
        const axios = require('axios');
        const res = await axios.get('https://he.wikivoyage.org/w/api.php', {
            params: {
                action:        'query',
                list:          'search',
                srsearch:      cityNameEn,
                srlimit:       1,
                format:        'json',
                formatversion: 2
            },
            timeout: 10000
        });
        const results = res.data.query.search;
        if (results && results.length > 0) return results[0].title;
    } catch (e) {
        // ignore
    }
    return null;
}

async function scrapeCountry(countryEn, countryHe) {
    console.log(`  Country: ${countryEn}`);

    const countryId = await upsertCountry(countryEn, countryHe);

    // fetch country page to discover cities
    const wikitext = await fetchWikitext('en', countryEn);
    await sleep(DELAY_MS);

    if (!wikitext) {
        console.log(`    No page found for ${countryEn}, skipping`);
        return;
    }

    const cityNames = extractCityLinks(wikitext);
    console.log(`    Found ${cityNames.length} cities`);

    for (const cityName of cityNames) {
        await scrapeCity(cityName, countryId);
        await sleep(DELAY_MS);
    }
}

async function main() {
    console.log('Starting Wikivoyage scraper for South America...\n');

    for (const country of SOUTH_AMERICA_COUNTRIES) {
        await scrapeCountry(country.en, country.he);
    }

    await closePool();
    console.log('\nDone!');
}

main().catch(err => {
    console.error('Scraper failed:', err);
    process.exit(1);
});
