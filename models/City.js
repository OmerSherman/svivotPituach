class City {
    constructor(id, country_id, name, name_he, summary_he, banner_image_url) {
        this.id = id;
        this.country_id = country_id;
        this.name = name;
        this.name_he = name_he;
        this.summary_he = summary_he;
        this.banner_image_url = banner_image_url;
    }

    displaySummary() {
        return `${this.name_he} (${this.name}) - ${this.summary_he}`;
    }
}

module.exports = City;