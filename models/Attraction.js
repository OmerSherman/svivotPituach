class Attraction {
    constructor(id, city_id, name, name_he, type, tags, description_he, image_url, popularity_score, audience_scores, best_months, avoid_months, seasonal_note_he, source_article_ids) {
        this.id = id;
        this.city_id = city_id;
        this.name = name;
        this.name_he = name_he;
        this.type = type; // 'site', 'tour', or 'route'
        this.tags = tags; // Array of tags (e.g., ['nature', 'history'])
        this.description_he = description_he;
        this.image_url = image_url;
        this.popularity_score = popularity_score;
        this.audience_scores = audience_scores; // Object: { family: 9, couple: 10, solo: 7 }
        this.best_months = best_months; // Array of recommended months (e.g., [3, 4, 5])
        this.avoid_months = avoid_months; // Array of months to avoid (e.g., [1, 2])
        this.seasonal_note_he = seasonal_note_he; // Short explanation about seasonality in Hebrew
        this.source_article_ids = source_article_ids; // Array of source article IDs from source_articles table
    }

    displaySummary() {
        return `${this.name_he} (${this.type}) - ציון כללי: ${this.popularity_score}`;
    }

    // method to get rate by type of travelers e.g: {family:10}
    getScoreForAudience(travelerType) {
        if (this.audience_scores && this.audience_scores[travelerType]) {
            return this.audience_scores[travelerType];
        }
        return "No score for this traveler type";
    }

    // returns true if the given month number is recommended for this attraction
    isRecommendedMonth(month) {
        return this.best_months.includes(month);
    }
}

module.exports = Attraction;