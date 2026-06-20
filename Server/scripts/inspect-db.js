require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { prisma } = require('../db');

async function main() {
    const rows = await prisma.attraction.findMany({
        orderBy: { attractionId: 'asc' },
        select: { attractionId: true, name: true, nameHE: true, descriptionHe: true, img_url: true, cityId: true }
    });

    function isMostlyEnglish(text) {
        if (!text) return true;
        const latin = (text.match(/[a-zA-Z]/g) || []).length;
        const hebrew = (text.match(/[\u0590-\u05FF]/g) || []).length;
        return latin > hebrew;
    }

    console.log('Attractions with English-heavy description:');
    rows.filter(function(r) { return isMostlyEnglish(r.descriptionHe); }).forEach(function(r) {
        console.log(r.attractionId, r.nameHE || r.name, '|', (r.descriptionHe || '').slice(0, 60));
    });

    console.log('\nLoremflickr images:', rows.filter(function(r) {
        return r.img_url && r.img_url.includes('loremflickr');
    }).length);

    await prisma.$disconnect();
}

main();
