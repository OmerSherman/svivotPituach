class City {
    constructor(id, country_id, name, name_he, summary_he, banner_im) {
        this.id = id;
        this.country_id = country_id;
        this.name = name;
        this.name_he = name_he;
        this.summary_he = summary_he;
        this.banner_im = banner_im;
    }

    displaySummary() {
        return `${this.name_he} (${this.name}) - ${this.summary_he}`;
    }
    
}

module.exports = City;