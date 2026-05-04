class Attraction {
    constructor(id, city_id, name, name_he, type, tags, description_he, image_url, popularity_score, audience_scores, best_months, avoid_months, seasonal_note_he, source_article_ids) {
        this.id = id;
        this.city_id = city_id;
        this.name = name;
        this.name_he = name_he;
        this.type = type; // site, tour, or route
        this.tags = tags;
        this.description_he = description_he;
        this.image_url = image_url;
        this.popularity_score = popularity_score;
        this.audience_scores = audience_scores; // e.g { family: 9, couple: 10, solo: 7 }
        this.best_months = best_months;
        this.avoid_months = avoid_months;
        this.seasonal_note_he = seasonal_note_he;
        this.source_article_ids = source_article_ids;
    }

    displaySummary() {
        return `${this.name_he} (${this.type}) - ציון כללי: ${this.popularity_score}`;
    }

    // returns the score for a given traveler type e.g getScoreForAudience('family')
    getScoreForAudience(travelerType) {
        if (this.audience_scores && this.audience_scores[travelerType]) {
            return this.audience_scores[travelerType];
        }
        return null;
    }

    // returns true if the given month is in the recommended months list
    isRecommendedMonth(month) {
        return this.best_months.includes(month);
    }
}

module.exports = Attraction;