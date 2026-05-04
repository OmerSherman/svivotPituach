const cities = require('../models/mock_data/cities.json');

// GET - all cities
function getAll(req, res) {
    return res.status(200).json({
        success: true,
        data: cities,
        error: null
    });
}

// GET - search cities by name, used for the search bar on the homepage
function search(req, res) {
    const q = req.query.q;

    if (!q) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "search query is required",
                details: {}
            }
        });
    }

    // search works in both english and hebrew
    const results = cities.filter(function(city) {
        return city.name.toLowerCase().includes(q.toLowerCase()) ||
               city.name_he.includes(q);
    });

    return res.status(200).json({
        success: true,
        data: results,
        error: null
    });
}

// GET - one city by id
function getById(req, res) {
    const id = req.params.id;

    const city = cities.find(function(c) {
        return c.id === parseInt(id);
    });

    if (!city) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "city " + id + " not found",
                details: {}
            }
        });
    }

    return res.status(200).json({
        success: true,
        data: city,
        error: null
    });
}

module.exports = { getAll, search, getById };