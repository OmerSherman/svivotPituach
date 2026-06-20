const profiles = require('../models/mock_data/profiles.json');
const attractions = require('../models/mock_data/attractions.json');
const groqService = require('../services/groqService');

const COUNTRY_NAMES = { 1: 'פרו', 2: 'ארגנטינה', 3: 'ברזיל' };
const MONTH_NAMES = ['', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const STYLE_NAMES = { solo: 'מוצ\'ילר', couple: 'רומנטי', family: 'משפחתי', group: 'קבוצתי' };
const BUDGET_NAMES = { low: 'חסכוני', medium: 'בינוני', high: 'פרימיום' };

function getUserId(req) {
    const id = parseInt(req.headers['x-user-id']);
    return isNaN(id) ? null : id;
}

function requireAuth(req, res) {
    const userId = getUserId(req);
    if (!userId) {
        res.status(401).json({
            success: false, data: null,
            error: { code: 'UNAUTHORIZED', message: 'not logged in', details: {} }
        });
        return null;
    }
    return userId;
}

function buildTripContext(trip) {
    const favoriteAttractions = (trip.favorites || [])
        .map(function(attractionId) {
            const attraction = attractions.find(function(a) { return a.id === attractionId; });
            return attraction ? attraction.name_he : null;
        })
        .filter(Boolean);

    return {
        name: trip.name,
        country: COUNTRY_NAMES[trip.countryId] || 'לא ידוע',
        dates: MONTH_NAMES[trip.startMonth] + ' – ' + MONTH_NAMES[trip.endMonth],
        travelStyle: STYLE_NAMES[trip.travelerType] || trip.travelerType,
        budget: BUDGET_NAMES[trip.budgetLevel] || trip.budgetLevel,
        interests: trip.interests || [],
        favoriteAttractions: favoriteAttractions
    };
}

// POST /api/ai/trip-summary
async function tripSummary(req, res, next) {
    try {
        const userId = requireAuth(req, res);
        if (!userId) return;

        const tripId = parseInt(req.body.tripId);
        if (isNaN(tripId)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: 'VALIDATION_ERROR', message: 'tripId must be a number', details: {} }
            });
        }

        const trip = profiles.find(function(p) { return p.id === tripId; });
        if (!trip) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: 'NOT_FOUND', message: 'trip not found', details: {} }
            });
        }

        if (trip.userId !== userId) {
            return res.status(403).json({
                success: false, data: null,
                error: { code: 'FORBIDDEN', message: 'not your trip', details: {} }
            });
        }

        const summary = await groqService.summarizeTrip(buildTripContext(trip));

        return res.status(200).json({
            success: true,
            data: { summary: summary },
            error: null
        });
    } catch (err) {
        if (err.aiUnavailable) {
            return res.status(503).json({
                success: false, data: null,
                error: {
                    code: 'AI_UNAVAILABLE',
                    message: 'עוזר ה-AI אינו זמין כרגע. נסה/י שוב מאוחר יותר.',
                    details: {}
                }
            });
        }
        next(err);
    }
}

module.exports = { tripSummary };
