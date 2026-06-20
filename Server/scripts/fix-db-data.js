/**
 * Fix broken image URLs (loremflickr) + English-only content in DB.
 * Run: node Server/scripts/fix-db-data.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { prisma } = require('../db');

const mockAttractions = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../models/mock_data/attractions.json'), 'utf8')
);

// Stable images — picsum.photos always loads in browsers
function cityImage(id) {
    return 'https://picsum.photos/seed/shvil-city-' + id + '/800/600';
}

function attractionImage(id) {
    return 'https://picsum.photos/seed/shvil-attr-' + id + '/800/600';
}

const CITIES = {
    1: {
        cityNameEn: 'Lima',
        cityNameHe: 'לימה',
        summaryHe: 'בירת פרו, עיר של קוויצ\'ה מעולה, שכונות קולוניאליות וחופי האוקיינוס השקט. שער הכניסה לפרו ומרכז גסטרונומי עולמי.'
    },
    2: {
        cityNameEn: 'Buenos Aires',
        cityNameHe: 'בואנוס איירס',
        summaryHe: 'בירתה התוססת של ארגנטינה, המכונה "פריז של דרום אמריקה" בזכות האדריכלות האירופאית, הטנגו והתרבות העשירה.'
    },
    3: {
        cityNameEn: 'Rio de Janeiro',
        cityNameHe: 'ריו דה ז\'ניירו',
        summaryHe: 'עיר החופים והקרנבל המפורסם בברזיל. ביתם של פסל הישו, גבעת הסוכר וחופי קופקבאנה ואיפאנמה.'
    },
    4: {
        cityNameEn: 'Cusco',
        cityNameHe: 'קוסקו',
        summaryHe: 'עיר עתיקה בלב הרי האנדים, שהייתה בירת האימפריה האינקאית. שער הכניסה למאצ\'ו פיצ\'ו ומרכז תרבותי עשיר.'
    },
    5: {
        cityNameEn: 'Cali',
        cityNameHe: 'קאלי',
        summaryHe: 'עיר הסלסה והקפה בדרום קולומביה. לילות תוססים, מוזיקה חיה ושוקי אמנות.'
    },
    6: {
        cityNameEn: 'Bogotá',
        cityNameHe: 'בוגוטה',
        summaryHe: 'בירת קולומביה בגובה 2,640 מטר — מוזיאונים, Ciclovía וקולינריה מגוונת.'
    },
    7: {
        cityNameEn: 'Buenos Aires Centro',
        cityNameHe: 'בואנוס איירס — מרכז',
        summaryHe: 'אטרקציות מרכז העיר: אובליסק, Casa Rosada, שכונות היסטוריות ואדריכלות קלאסית.'
    },
    8: {
        cityNameEn: 'Córdoba',
        cityNameHe: 'קורדובה (ארגנטינה)',
        summaryHe: 'עיר אוניברסיטאית עם מוזיאונים, מרכז היסטורי ומלונות לתרמילאים.'
    }
};

const COUNTRIES = {
    1: {
        summaryHe: 'מדינה של האנדים, יערות גשם, חופים ומורשת אינקאית. בית למאצ\'ו פיצ\'ו, קוסקו ולימה.',
    },
    2: {
        summaryHe: 'טנגו, סטייקים, יין מנדoza ואדריכלות אירופאית. בואנוס איירס — "פריז של דרום אמריקה".',
    },
    3: {
        summaryHe: 'קרנבל, חופים, פסל הישו ויער האמזונס. ברזיל — היעד הגדול ביותר בדרום אמריקה.',
    },
    4: {
        summaryHe: 'קפה, סלסה, הקריביים ורכסי האנדים. קולומביה — מגוון נופים ותרבות עשירה.',
    }
};

// Scraped attractions — Hebrew names + descriptions
const ATTRACTION_FIXES = {
    21: { nameHE: 'שוק רקולטה', descriptionHe: 'שוק אמנות ומסחר עם תכשיטים, צעיפים ומוצרי אמנות מקומיים.' },
    22: { nameHE: 'קatedral סן פדרו', descriptionHe: 'הקatedralis הראשית של קאלי, נבנתה ב-1841. אתר היסטורי ואדריכלי מרשים.' },
    23: { nameHE: 'פסל החתול על הנהר', descriptionHe: 'פסל ענק של חתול ליד נהר קאלי — סמל מקומי ידוע בעיר.' },
    24: { nameHE: 'סיורי אופנועים — מוטולומbia', descriptionHe: 'חברת סיורים והשכרת אופנועים. טיולי ATV בהרים וסיורי אופנוע בקולומביה.' },
    25: { nameHE: 'קניון צ\'יפיצ\'ape', descriptionHe: 'מרכז קניות גדול עם מסעדות, חנויות מקומיות ואווירה תוססת.' },
    26: { nameHE: 'קניון אוניסentro', descriptionHe: 'הקניון הגדול ביותר בעיר. קולנוע, קזינו, מסעדות וחנויות.' },
    27: { nameHE: 'Palmetto Plaza', descriptionHe: 'מרכז קניות ופנאי популярי בקרב צעירים, עם ברים ומסעדות בחוץ.' },
    28: { nameHE: 'El Solar', descriptionHe: 'מסעדה עם ישיבה בחוץ, תפריט מגוון ואווירה נעימה.' },
    29: { nameHE: 'Pacífico', descriptionHe: 'מסעדת פירות ים איכותית עם מתכונים מהחוף הקולומbianי.' },
    30: { nameHE: 'Tizones', descriptionHe: 'מסעדת בשרים ופירות ים — סטייקים ודגים מעולים.' },
    31: { nameHE: 'Ringlete', descriptionHe: 'מטבח מקומי איכותי עם דגש על מתכונים מבanana plantain.' },
    32: { nameHE: 'Ciclovía בבוגוטה', descriptionHe: 'בכל יום ראשון וחג, רחובות ראשיים נסגרים לרכב ומתמלאים באופניים והולכי רגל.' },
    33: { nameHE: 'Sabana de Bogotá', descriptionHe: 'אזור ביצות וטבע עשיר ליד בוגוטה — טיולי טבע, צפרים ונוף ייחודי.' },
    34: { nameHE: 'האובליסק', descriptionHe: 'סמל בואנוס איירס האייקוני — נקודת צילום חובה במרכז העיר.' },
    35: { nameHE: 'ארמון Barolo', descriptionHe: 'בניין אייקוני בסגנון ארט-דco עם תצפית מרהיבה על העיר.' },
    36: { nameHE: 'ארמון המשפטים', descriptionHe: 'ארמון המשפטים ההיסטורי במרכז בואנוס איירס.' },
    37: { nameHE: 'Pasaje Rivarola', descriptionHe: 'מעבר מקורה היסטורי עם חנויות ואדריכלות ייחודית.' },
    38: { nameHE: 'כיכר הקongress', descriptionHe: 'כיכר הקongress עם בניין הפרלament הארגנטינאי.' },
    39: { nameHE: 'Casa Rosada', descriptionHe: 'ארמון הממשלה הארגנטינאי על כיכר מאיו.' },
    40: { nameHE: 'Confitería Ideal', descriptionHe: 'בית קפה וקונדיטוריה היסטורי, מוקד טango ותרבות.' },
    41: { nameHE: 'בית התרבות', descriptionHe: 'מרכז תרבותי עם אירועים, תערוכות ופעילויות אמנות.' },
    42: { nameHE: 'חנות הספרים La Calesita', descriptionHe: 'חנות ספרים ייחודית במרכז העיר.' },
    43: { nameHE: 'La Boutique del Angel', descriptionHe: 'חנות אמנות ועיצוב ייחודית בשכונת San Telmo.' },
    44: { nameHE: 'מוזיאון ארכיאולוגיה ואנthropologia', descriptionHe: 'מוזיאון ארכיאולוגיה ואנthropologia — ממצאים מהאזור.' },
    45: { nameHE: 'מוזיאון הדינוזאורים', descriptionHe: 'מוזיאון ממצאים וFossils מהאזור.' },
    46: { nameHE: 'The One Hostel', descriptionHe: 'Hostel популяרי לתרמילאים בקordoba.' },
    47: { nameHE: 'Baluch Backpackers', descriptionHe: 'Hostel לתרמילאים במרכז קordoba.' },
    48: { nameHE: 'Mediterranea Hostel', descriptionHe: 'Hostel נוח לתרמילאים בקordoba.' },
    49: { nameHE: 'Che Salguero Hostel', descriptionHe: 'Hostel בקordoba עם אווירה חברתית.' },
    50: { nameHE: 'Kailash Hotel Boutique', descriptionHe: 'מלון בoutique בקordoba.' },
    51: { nameHE: 'Link Cordoba Hostel', descriptionHe: 'Hostel מומלץ לתרמילאים.' },
    52: { nameHE: 'Tango Hostel', descriptionHe: 'Hostel עם אווירת טango וחיי לילה.' },
    53: { nameHE: 'Cordoba Backpackers', descriptionHe: 'Hostel לתרמילאים בקordoba.' }
};

function isMostlyEnglish(text) {
    if (!text) return true;
    const latin = (text.match(/[a-zA-Z]/g) || []).length;
    const hebrew = (text.match(/[\u0590-\u05FF]/g) || []).length;
    return latin > hebrew;
}

async function fixCountries() {
    for (const [id, data] of Object.entries(COUNTRIES)) {
        await prisma.country.update({
            where: { countryId: parseInt(id, 10) },
            data: {
                summaryHe: data.summaryHe,
                bannerImageUrl: cityImage('country-' + id)
            }
        });
    }
    console.log('Countries fixed:', Object.keys(COUNTRIES).length);
}

async function fixCities() {
    for (const [id, data] of Object.entries(CITIES)) {
        await prisma.city.update({
            where: { cityId: parseInt(id, 10) },
            data: {
                cityNameEn: data.cityNameEn,
                cityNameHe: data.cityNameHe,
                summaryHe: data.summaryHe,
                bannerImageUrl: cityImage(id)
            }
        });
    }
    console.log('Cities fixed:', Object.keys(CITIES).length);
}

async function fixAttractions() {
    // Top 20 — full Hebrew content from seed file + working images
    for (const a of mockAttractions) {
        await prisma.attraction.update({
            where: { attractionId: a.id },
            data: {
                nameHE: a.name_he,
                descriptionHe: a.description_he,
                img_url: attractionImage(a.id),
                tags: a.tags,
                popularity_score: a.popularity_score,
                audience_scores: a.audience_scores,
                best_months: a.best_months,
                avoid_months: a.avoid_months || [],
                seasonal_note_he: a.seasonal_note_he || null
            }
        });
    }
    console.log('Top attractions (1-20) synced from seed');

    const rows = await prisma.attraction.findMany({
        where: { attractionId: { gt: 20 } },
        include: { city: true },
        orderBy: { attractionId: 'asc' }
    });

    for (const a of rows) {
        const patch = ATTRACTION_FIXES[a.attractionId];
        const cityName = a.city ? a.city.cityNameHe : 'דרום אמריקה';
        const data = {
            img_url: attractionImage(a.attractionId)
        };

        if (patch && patch.nameHE) data.nameHE = patch.nameHE;
        if (patch && patch.descriptionHe && !isMostlyEnglish(patch.descriptionHe)) {
            data.descriptionHe = patch.descriptionHe;
        } else if (isMostlyEnglish(a.descriptionHe)) {
            data.descriptionHe = 'אטרקציה מומלצת ב' + cityName + '.';
        }

        await prisma.attraction.update({
            where: { attractionId: a.attractionId },
            data: data
        });
    }
    console.log('Scraped attractions (21+) fixed:', rows.length);
}

async function verify() {
    const lorem = await prisma.attraction.count({
        where: { img_url: { contains: 'loremflickr' } }
    });
    const cityLorem = await prisma.city.count({
        where: { bannerImageUrl: { contains: 'loremflickr' } }
    });
    console.log('\nRemaining loremflickr — attractions:', lorem, 'cities:', cityLorem);

    const sample = await prisma.city.findFirst({ where: { cityId: 1 } });
    console.log('Sample city banner:', sample.bannerImageUrl);
}

async function run() {
    console.log('Fixing DB data...\n');
    await fixCountries();
    await fixCities();
    await fixAttractions();
    await verify();
    await prisma.$disconnect();
    console.log('\nDone. Restart server and refresh browser.');
}

if (require.main === module) {
    run().catch(async function(err) {
        console.error(err);
        await prisma.$disconnect();
        process.exit(1);
    });
}

module.exports = { run };
