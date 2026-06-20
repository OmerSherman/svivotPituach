// keep these lists identical to TripForm.jsx's COUNTRIES/INTEREST_OPTIONS/travelStyle/budget values
const VALID_COUNTRY_IDS = [1, 2, 3];
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

// returns {valid, missing, cleanInterests} - interests are filtered, not rejected
function validateTripDraft(draft) {
    var missing = [];

    if (!draft || typeof draft.name !== 'string' || !draft.name.trim()) {
        missing.push('name');
    }
    if (!draft || !VALID_COUNTRY_IDS.includes(draft.countryId)) {
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
    VALID_COUNTRY_IDS,
    VALID_TRAVEL_STYLES,
    VALID_BUDGETS,
    VALID_INTERESTS
};
