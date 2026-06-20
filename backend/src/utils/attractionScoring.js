const TRAVEL_STYLES = ['solo', 'couple', 'family', 'group'];

const TYPE_LABELS = {
    site: 'אתר',
    tour: 'סיור',
    route: 'מסלול'
};

const STYLE_LABELS = {
    solo: 'מטייל יחיד',
    couple: 'זוגי',
    family: 'משפחתי',
    group: 'קבוצתי'
};

const TYPE_BASE = {
    site: 72,
    tour: 78,
    route: 74
};

const TYPE_STYLE_BONUS = {
    solo:   { site: 2, tour: 5, route: 10 },
    couple: { site: 4, tour: 7, route: 12 },
    family: { site: 12, tour: 8, route: 5 },
    group:  { site: 8, tour: 12, route: 6 }
};

const STYLE_TAG_WEIGHTS = {
    solo: {
        'הליכה': 12, 'צילום': 10, 'ייחודי': 10, 'טבע': 8, 'נוף': 6,
        'הרפתקאות': 10, 'היסטוריה': 4, 'תרבות': 4
    },
    couple: {
        'רומנטי': 15, 'נוף': 10, 'אוכל': 8, 'תרבות': 6, 'אמנות': 8,
        'אדריכלות': 6, 'אופרה': 8, 'מוזיקה': 5, 'הליכה': 4
    },
    family: {
        'חוף': 12, 'טבע': 8, 'היסטוריה': 6, 'תרבות': 6, 'שווקים': 5,
        'אוכל': 5, 'אמנות': 4, 'מודרני': 4
    },
    group: {
        'תרבות': 10, 'היסטוריה': 10, 'שווקים': 8, 'אוכל': 6, 'מוזיקה': 6,
        'אמנות': 5, 'אדריכלות': 5, 'טנגו': 4
    }
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getTags(attraction) {
    return Array.isArray(attraction.tags) ? attraction.tags : [];
}

function buildPopularityBreakdown(attraction) {
    var type = attraction.type || 'site';
    var tags = getTags(attraction);
    var reasons = [];
    var score = TYPE_BASE[type] || 70;

    reasons.push('בסיס לפי סוג ' + (TYPE_LABELS[type] || type) + ': ' + score);

    var tagBonus = Math.min(tags.length * 2, 10);
    if (tagBonus > 0) {
        score += tagBonus;
        reasons.push(tags.length + ' תגיות מוסיפות +' + tagBonus);
    }

    if (attraction.description_he) {
        var descBonus = Math.min(Math.floor(attraction.description_he.length / 45), 8);
        if (descBonus > 0) {
            score += descBonus;
            reasons.push('תיאור מפורט +' + descBonus);
        }
    }

    if (attraction.image_url) {
        score += 5;
        reasons.push('יש תמונה +5');
    }

    var bestMonths = attraction.best_months || [];
    if (bestMonths.length >= 10) {
        score += 5;
        reasons.push('מתאים לרוב החודשים +5');
    } else if (bestMonths.length > 0) {
        var monthBonus = Math.min(bestMonths.length, 4);
        score += monthBonus;
        reasons.push('חודשים מומלצים מוגדרים +' + monthBonus);
    }

    if (attraction.seasonal_note_he) {
        score += 2;
        reasons.push('הערה עונתית +2');
    }

    return {
        score: clamp(Math.round(score), 0, 100),
        reasons: reasons
    };
}

function computePopularityScore(attraction) {
    return buildPopularityBreakdown(attraction).score;
}

function buildAudienceBreakdown(attraction, style) {
    var type = attraction.type || 'site';
    var tags = getTags(attraction);
    var reasons = [];
    var score = 52;
    var typeBonus = (TYPE_STYLE_BONUS[style] || {})[type] || 0;

    if (typeBonus > 0) {
        score += typeBonus;
        reasons.push('סוג ' + (TYPE_LABELS[type] || type) + ' מתאים ל' + STYLE_LABELS[style] + ' +' + typeBonus);
    }

    var tagWeights = STYLE_TAG_WEIGHTS[style] || {};
    tags.forEach(function(tag) {
        if (tagWeights[tag]) {
            score += tagWeights[tag];
            reasons.push('תגית "' + tag + '" +' + tagWeights[tag]);
        }
    });

    if (reasons.length === 0) {
        reasons.push('ציון בסיס ללא תגיות מיוחדות לסגנון זה');
    }

    return {
        score: clamp(Math.round(score), 0, 100),
        reasons: reasons
    };
}

function computeAudienceScores(attraction) {
    var result = {};
    TRAVEL_STYLES.forEach(function(style) {
        result[style] = buildAudienceBreakdown(attraction, style).score;
    });
    return result;
}

function getMonthRange(startMonth, endMonth) {
    if (!startMonth || !endMonth) return [];
    var months = [];
    var current = startMonth;
    while (true) {
        months.push(current);
        if (current === endMonth) break;
        current = current === 12 ? 1 : current + 1;
    }
    return months;
}

function buildMonthFitBreakdown(bestMonths, tripMonths) {
    if (!tripMonths || tripMonths.length === 0 || !bestMonths || bestMonths.length === 0) {
        return { score: 70, reason: 'לא הוגדרו חודשי טיול — ציון ברירת מחדל' };
    }
    if (bestMonths.length >= 12) {
        return { score: 100, reason: 'מתאים לכל השנה' };
    }

    var matches = tripMonths.filter(function(m) { return bestMonths.includes(m); }).length;
    var ratio = matches / tripMonths.length;

    if (ratio >= 0.8) {
        return { score: 100, reason: 'רוב חודשי הטיול שלך מומלצים לאטרקציה' };
    }
    if (ratio >= 0.5) {
        return { score: 80, reason: 'חלק מחודשי הטיול שלך מתאימים' };
    }
    if (ratio > 0) {
        return { score: 55, reason: 'התאמה חלקית לחודשי הטיול' };
    }
    return { score: 25, reason: 'חודשי הטיול פחות מומלצים לאטרקציה' };
}

function computeMonthFitScore(bestMonths, tripMonths) {
    return buildMonthFitBreakdown(bestMonths, tripMonths).score;
}

function buildPersonalizedBreakdown(attraction, audienceScores, context) {
    var travelStyle = context.travelStyle || 'solo';
    var interests = context.interests || [];
    var tripMonths = context.tripMonths || [];
    var tags = getTags(attraction);

    var popularity = computePopularityScore(attraction);
    var audienceScore = audienceScores[travelStyle] || 50;
    var audienceDetail = buildAudienceBreakdown(attraction, travelStyle);

    var matchedTags = tags.filter(function(tag) { return interests.includes(tag); });
    var interestScore = interests.length === 0
        ? 60
        : clamp(Math.round((matchedTags.length / interests.length) * 100), 0, 100);

    var monthDetail = buildMonthFitBreakdown(attraction.best_months || [], tripMonths);
    var monthScore = monthDetail.score;

    var total = clamp(Math.round(
        popularity * 0.15 +
        audienceScore * 0.4 +
        interestScore * 0.3 +
        monthScore * 0.15
    ), 0, 100);

    var factors = [
        {
            label: 'התאמה לסגנון ' + STYLE_LABELS[travelStyle],
            score: audienceScore,
            weight: '40%',
            reasons: audienceDetail.reasons
        },
        {
            label: 'חפיפת תחומי עניין',
            score: interestScore,
            weight: '30%',
            reasons: matchedTags.length > 0
                ? ['תגיות משותפות: ' + matchedTags.join(', ')]
                : interests.length === 0
                    ? ['לא הוגדרו תחומי עניין בטיול']
                    : ['אין חפיפה עם תחומי העניין שלך']
        },
        {
            label: 'התאמה לחודשי הטיול',
            score: monthScore,
            weight: '15%',
            reasons: [monthDetail.reason]
        },
        {
            label: 'פופולריות כללית',
            score: popularity,
            weight: '15%',
            reasons: buildPopularityBreakdown(attraction).reasons.slice(0, 3)
        }
    ];

    return {
        score: total,
        travelStyle: travelStyle,
        matchedTags: matchedTags,
        factors: factors
    };
}

function computePersonalizedScore(attraction, audienceScores, context) {
    return buildPersonalizedBreakdown(attraction, audienceScores, context).score;
}

function parsePersonalizationContext(query) {
    if (!query) return null;

    var travelStyle = query.travelStyle || query.travelerType;
    if (!travelStyle && !query.interests && !query.startMonth) {
        return null;
    }

    var interests = [];
    if (query.interests) {
        interests = String(query.interests)
            .split(',')
            .map(function(t) { return t.trim(); })
            .filter(Boolean);
    }

    var startMonth = parseInt(query.startMonth, 10);
    var endMonth = parseInt(query.endMonth, 10);
    var tripMonths = [];

    if (!isNaN(startMonth) && !isNaN(endMonth)) {
        tripMonths = getMonthRange(startMonth, endMonth);
    }

    return {
        travelStyle: travelStyle || 'solo',
        interests: interests,
        tripMonths: tripMonths
    };
}

function enrichAttraction(attraction, context) {
    var popularity = buildPopularityBreakdown(attraction);
    var audience_scores = computeAudienceScores(attraction);
    var audience_breakdown = {};

    TRAVEL_STYLES.forEach(function(style) {
        audience_breakdown[style] = buildAudienceBreakdown(attraction, style);
    });

    var enriched = Object.assign({}, attraction, {
        popularity_score: popularity.score,
        audience_scores: audience_scores,
        scores_computed: true,
        score_breakdown: {
            popularity: popularity,
            audience: audience_breakdown
        }
    });

    if (context) {
        var personalized = buildPersonalizedBreakdown(attraction, audience_scores, context);
        enriched.personalized_score = personalized.score;
        enriched.score_breakdown.personalized = personalized;
    }

    return enriched;
}

module.exports = {
    computePopularityScore,
    computeAudienceScores,
    computePersonalizedScore,
    parsePersonalizationContext,
    enrichAttraction
};
