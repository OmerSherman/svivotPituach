class Country {
    constructor(id, name, code) {
        this.id = id;
        this.name = name;
        this.code = code; // e.g., 'AR', 'PE', 'BR'
    }

    // Returns a formatted string of the country
    displayCountry() {
        return `${this.name} (${this.code})`;
    }

}

module.exports = Country;