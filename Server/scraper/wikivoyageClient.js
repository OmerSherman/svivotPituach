const axios = require('axios');

const HEADERS = {
    'User-Agent': 'SvivotPituachScraper/1.0 (educational project; contact: omersher@post.bgu.ac.il)'
};

const ENDPOINTS = {
    en: 'https://en.wikivoyage.org/w/api.php',
    he: 'https://he.wikivoyage.org/w/api.php'
};

async function fetchWikitext(lang, pageName) {
    const params = {
        action:        'query',
        titles:        pageName,
        prop:          'revisions',
        rvprop:        'content',
        rvslots:       'main',
        format:        'json',
        formatversion: 2
    };

    const res = await axios.get(ENDPOINTS[lang], { params, headers: HEADERS, timeout: 15000 });
    const page = res.data.query.pages[0];
    if (!page || page.missing) return null;
    return page.revisions[0].slots.main.content;
}

async function fetchCoordinates(lang, pageName) {
    const params = {
        action:        'query',
        titles:        pageName,
        prop:          'coordinates',
        format:        'json',
        formatversion: 2
    };

    const res = await axios.get(ENDPOINTS[lang], { params, headers: HEADERS, timeout: 15000 });
    const page = res.data.query.pages[0];
    if (!page || !page.coordinates || page.coordinates.length === 0) return null;
    return { latitude: page.coordinates[0].lat, longitude: page.coordinates[0].lon };
}

// returns all page titles in a Wikivoyage category
async function fetchCategoryMembers(lang, category) {
    const members = [];
    let cmcontinue = undefined;

    do {
        const params = {
            action:    'query',
            list:      'categorymembers',
            cmtitle:   `Category:${category}`,
            cmlimit:   500,
            cmtype:    'page',
            format:    'json',
            formatversion: 2,
            ...(cmcontinue ? { cmcontinue } : {})
        };

        const res = await axios.get(ENDPOINTS[lang], { params, headers: HEADERS, timeout: 15000 });
        const data = res.data;
        members.push(...(data.query.categorymembers || []));
        cmcontinue = data.continue ? data.continue.cmcontinue : undefined;
    } while (cmcontinue);

    return members.map(m => m.title);
}

// returns wikilinks found inside a section of wikitext  e.g. [[Buenos Aires]]
function extractWikilinks(wikitext) {
    const matches = [];
    const re = /\[\[([^\]|#]+?)(?:\|[^\]]+)?\]\]/g;
    let m;
    while ((m = re.exec(wikitext)) !== null) {
        matches.push(m[1].trim());
    }
    return matches;
}

module.exports = { fetchWikitext, fetchCoordinates, fetchCategoryMembers, extractWikilinks };
