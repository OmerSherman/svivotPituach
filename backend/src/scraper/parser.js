// Parses Wikivoyage wikitext to extract attractions and city-level links.
// Wikivoyage uses templates like {{see}}, {{do}}, {{buy}}, {{eat}}, {{drink}}, {{sleep}}
// Each template has named parameters: name, alt, url, email, address, lat, long, content, etc.

// Map Wikivoyage template names → our attraction types (English + Hebrew)
const TYPE_MAP = {
    // English templates
    see:   'site',
    do:    'tour',
    buy:   'site',
    eat:   'site',
    drink: 'site',
    sleep: 'site',
    // Hebrew templates
    'מוקדי':  'site',
    'עשה':    'tour',
    'קנה':    'site',
    'אכול':   'site',
    'שתה':    'site',
    'לינה':   'site'
};

// Base tags assigned by template type
const TEMPLATE_BASE_TAGS = {
    see:   ['תרבות'],
    do:    ['הליכה'],
    buy:   ['קניות'],
    eat:   ['אוכל'],
    drink: ['חיי לילה'],
    sleep: []
};

// Keyword → Hebrew tags mapping (checked against name + description in English)
const KEYWORD_TAG_MAP = [
    { keywords: ['museum', 'gallery', 'exhibit', 'art'],          tags: ['אמנות', 'תרבות'] },
    { keywords: ['cathedral', 'church', 'temple', 'mosque', 'synagogue', 'basilica'], tags: ['תרבות', 'אדריכלות'] },
    { keywords: ['palace', 'castle', 'fort', 'ruins', 'ancient', 'historic', 'colonial', 'inca', 'archaeological'], tags: ['היסטוריה', 'אדריכלות'] },
    { keywords: ['park', 'garden', 'jungle', 'forest', 'nature', 'wildlife', 'reserve', 'rainforest'], tags: ['טבע'] },
    { keywords: ['mountain', 'hill', 'volcano', 'peak', 'viewpoint', 'panoram', 'overlook', 'scenic'], tags: ['נוף', 'טבע'] },
    { keywords: ['beach', 'coast', 'shore', 'bay', 'waterfront', 'surf', 'swim'], tags: ['חוף'] },
    { keywords: ['walk', 'hike', 'trail', 'path', 'route', 'promenade', 'boardwalk', 'cliff'], tags: ['הליכה'] },
    { keywords: ['photo', 'photography', 'sunset', 'sunrise', 'view', 'lookout'], tags: ['צילום', 'נוף'] },
    { keywords: ['market', 'shop', 'mall', 'boutique', 'fair', 'craft'], tags: ['קניות'] },
    { keywords: ['restaurant', 'food', 'cuisine', 'gastro', 'eat', 'ceviche', 'steakhouse'], tags: ['אוכל'] },
    { keywords: ['bar', 'club', 'tango', 'show', 'night', 'jazz', 'theater', 'theatre', 'opera', 'concert'], tags: ['חיי לילה', 'תרבות'] },
    { keywords: ['architecture', 'building', 'mansion', 'boulevard', 'tower'], tags: ['אדריכלות'] }
];

// Derive tags from template name + attraction name/description
function deriveTags(templateName, name, description) {
    const tagSet = new Set(TEMPLATE_BASE_TAGS[templateName] || []);
    const text = (name + ' ' + description).toLowerCase();

    for (const { keywords, tags } of KEYWORD_TAG_MAP) {
        if (keywords.some(kw => text.includes(kw))) {
            tags.forEach(t => tagSet.add(t));
        }
    }

    return [...tagSet];
}

// Extract all {{template|param=value|...}} blocks from wikitext
function parseTemplates(wikitext, templateName) {
    const results = [];
    const openTag = new RegExp(`\\{\\{\\s*${templateName}\\s*\\|`, 'gi');
    let match;

    while ((match = openTag.exec(wikitext)) !== null) {
        let depth = 2; // opening {{ counts as 2
        let i = match.index + 2;
        let body = '';

        while (i < wikitext.length && depth > 0) {
            if (wikitext[i] === '{' && wikitext[i + 1] === '{') { depth += 2; i += 2; body += '{{'; }
            else if (wikitext[i] === '}' && wikitext[i + 1] === '}') { depth -= 2; if (depth > 0) { body += '}}'; } i += 2; }
            else { body += wikitext[i]; i++; }
        }

        results.push(body);
    }

    return results;
}

// Parse key=value pairs from a template body string
function parseParams(body) {
    const params = {};
    // split on | but not inside nested {{ }}
    const parts = [];
    let depth = 0;
    let current = '';

    for (let i = 0; i < body.length; i++) {
        if (body[i] === '{' && body[i + 1] === '{') { depth++; current += '{{'; i++; }
        else if (body[i] === '}' && body[i + 1] === '}') { depth--; current += '}}'; i++; }
        else if (body[i] === '|' && depth === 0) { parts.push(current); current = ''; }
        else current += body[i];
    }
    if (current) parts.push(current);

    for (const part of parts) {
        const eq = part.indexOf('=');
        if (eq === -1) continue;
        const key = part.slice(0, eq).trim();
        const val = part.slice(eq + 1).trim();
        if (key) params[key] = val;
    }

    return params;
}

// Strip wikitext markup from a string
function stripMarkup(text) {
    if (!text) return '';
    return text
        .replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, '$1') // [[link|label]] → label
        .replace(/\{\{[^}]+\}\}/g, '')                      // remove templates
        .replace(/<ref[^>]*>.*?<\/ref>/gs, '')              // remove refs
        .replace(/<[^>]+>/g, '')                            // remove HTML tags
        .replace(/'{2,3}/g, '')                             // remove bold/italic
        .trim();
}

// Normalize params to always have .name, .description, .lat, .long
// Handles both English and Hebrew parameter names
function normalizeParams(p) {
    return {
        name:        p.name        || p['שם']           || p.alt || p['שם חלופי'] || '',
        description: p.content     || p.description     || p['תיאור'] || '',
        lat:         p.lat         || p.latitude        || '',
        long:        p.long        || p.longitude       || '',
        image:       p.image       || p['תמונה']        || ''
    };
}

// Extract attractions from wikitext for a city page
function extractAttractions(wikitext) {
    const attractions = [];

    for (const [templateName, type] of Object.entries(TYPE_MAP)) {
        const bodies = parseTemplates(wikitext, templateName);

        for (const body of bodies) {
            const raw = parseParams(body);
            const p   = normalizeParams(raw);

            const name = stripMarkup(p.name);
            if (!name) continue;

            const lat  = parseFloat(p.lat);
            const lng  = parseFloat(p.long);
            const desc = stripMarkup(p.description);

            attractions.push({
                name,
                type,
                description_he: desc,
                description_en: desc,
                image_url:      p.image ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(p.image)}` : null,
                latitude:       isNaN(lat) ? null : lat,
                longitude:      isNaN(lng) ? null : lng,
                tags:           deriveTags(templateName, name, desc)
            });
        }
    }

    return attractions;
}

// Extract Hebrew descriptions from HE wikitext, keyed by attraction name
function extractHeDescriptions(wikitext) {
    const map = {};

    for (const templateName of Object.keys(TYPE_MAP)) {
        const bodies = parseTemplates(wikitext, templateName);
        for (const body of bodies) {
            const raw = parseParams(body);
            const p   = normalizeParams(raw);
            const name = stripMarkup(p.name);
            if (!name) continue;
            const desc = stripMarkup(p.description);
            if (desc) map[name] = desc;
        }
    }

    return map;
}

// Extract country-level city links from a country page wikitext
// Wikivoyage country pages list cities in a {{citylist}} or plain wikilinks under == Cities == section
function extractCityLinks(wikitext) {
    // Find the Cities section and grab wikilinks from it
    const citySection = wikitext.match(/==\s*Cities?\s*==\s*([\s\S]*?)(?:\n==|\z)/i);
    const otherSection = wikitext.match(/==\s*Other destinations?\s*==\s*([\s\S]*?)(?:\n==|\z)/i);

    const links = new Set();

    function grabLinks(text) {
        const re = /\[\[([^\]|#]+?)(?:\|[^\]]+)?\]\]/g;
        let m;
        while ((m = re.exec(text)) !== null) {
            const title = m[1].trim();
            // skip files, categories, templates
            if (title.includes(':')) continue;
            links.add(title);
        }
    }

    if (citySection) grabLinks(citySection[1]);
    if (otherSection) grabLinks(otherSection[1]);

    return [...links];
}

// Extract district sub-page titles from a city page (e.g. "בואנוס איירס/סנטרו")
// Wikivoyage big-city articles list districts as [[CityName/DistrictName|...]]
function extractDistrictLinks(cityName, wikitext) {
    const links = new Set();
    const escaped = cityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\[\\[(${escaped}/[^\\]|#]+?)(?:\\|[^\\]]+)?\\]\\]`, 'g');
    let m;
    while ((m = re.exec(wikitext)) !== null) {
        links.add(m[1].trim());
    }
    return [...links];
}

// Extract country links from a region page (e.g. South America)
function extractCountryLinks(wikitext) {
    const links = new Set();
    const re = /\[\[([^\]|#]+?)(?:\|[^\]]+)?\]\]/g;
    let m;
    while ((m = re.exec(wikitext)) !== null) {
        const title = m[1].trim();
        if (title.includes(':')) continue;
        links.add(title);
    }
    return [...links];
}

module.exports = { extractAttractions, extractHeDescriptions, extractCityLinks, extractCountryLinks, extractDistrictLinks, stripMarkup };
