const countryRepo = require('../repositories/countryRepo');

const VALID_TRAVEL_STYLES = ['solo', 'couple', 'family', 'group'];
const VALID_BUDGETS = ['low', 'medium', 'high'];
const VALID_INTERESTS = [
    'תרבות', 'היסטוריה', 'טבע', 'נוף', 'אוכל',
    'אמנות', 'אדריכלות', 'חוף', 'הליכה', 'צילום',
    'חיי לילה', 'קניות'
];

function isValidMonth(month) {
    return Number.isInteger(month) && month >= 1 && month <= 12;
}

async function validateTripDraft(draft) {
    var missing = [];

    if (!draft || typeof draft.name !== 'string' || !draft.name.trim()) {
        missing.push('name');
    }
    if (!draft || !Number.isInteger(draft.countryId) || !(await countryRepo.exists(draft.countryId))) {
        missing.push('countryId');
    }
    if (!draft || !isValidMonth(draft.startMonth)) {
        missing.push('startMonth');
    }
    if (!draft || !isValidMonth(draft.endMonth)) {
        missing.push('endMonth');
    }
    if (!draft || !VALID_TRAVEL_STYLES.includes(draft.travelStyle)) {
        missing.push('travelStyle');
    }
    if (!draft || !VALID_BUDGETS.includes(draft.budget)) {
        missing.push('budget');
    }

    var cleanInterests = (draft && Array.isArray(draft.interests))
        ? draft.interests.filter(function(tag) { return VALID_INTERESTS.includes(tag); })
        : [];

    return {
        valid: missing.length === 0,
        missing: missing,
        cleanInterests: cleanInterests
    };
}

module.exports = {
    validateTripDraft,
    VALID_TRAVEL_STYLES,
    VALID_BUDGETS,
    VALID_INTERESTS
};
