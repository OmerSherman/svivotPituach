class Country {
    constructor(id, name, code) {
        this.id = id;
        this.name = name;
        this.code = code; // e.g AR, PE, BR
    }

    displayCountry() {
        return `${this.name} (${this.code})`;
    }
}

module.exports = Country;