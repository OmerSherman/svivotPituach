class Attraction {
    constructor(id, city_id, name, name_he, type, tags, description_he, image_url, popularity_score, audience_scores, best_mo) {
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
        this.best_mo = best_mo;
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
}

module.exports = Attraction;